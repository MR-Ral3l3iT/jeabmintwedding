#!/usr/bin/env node
/**
 * Create the LINE rich menu with tap areas measured from the artwork.
 *
 * LINE Official Account Manager only offers fixed template grids, and none of
 * them line up with this image (the banner/card split sits at 60% height, the
 * templates split at 50%). Registering the menu through the Messaging API lets
 * us give each card its exact pixel bounds.
 *
 * Usage:
 *   node scripts/setup-richmenu.mjs                 # create + upload + set default
 *   node scripts/setup-richmenu.mjs --dry-run       # print payload, call nothing
 *   node scripts/setup-richmenu.mjs --replace       # also delete other rich menus
 *   node scripts/setup-richmenu.mjs --list          # show what is registered now
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_PATH = join(REPO_ROOT, 'docs/assets/richmenu-jm-wedding.png');
const MAPS_URL = 'https://maps.app.goo.gl/MuHkXeetp6Ac5zGu9';

const API = 'https://api.line.me/v2/bot';
const API_DATA = 'https://api-data.line.me/v2/bot';
const MAX_IMAGE_BYTES = 1024 * 1024;

/**
 * Areas measured from the PNG by scripts/measure-richmenu.py. Card gaps sit at
 * x=405-423 and x=776-794, the banner/card divider at y=480-493, so the areas
 * are split down the middle of each gap. They tile the full 1200x810 canvas,
 * which means there are no dead pixels between buttons.
 */
const RICH_MENU = {
  size: { width: 1200, height: 810 },
  selected: true,
  name: 'Jeab & Mint Wedding — main',
  chatBarText: 'เมนูงานแต่ง',
  areas: [
    {
      // Decorative banner. No action so a stray tap up here does nothing.
      bounds: { x: 0, y: 0, width: 1200, height: 487 },
      action: { type: 'postback', data: 'richmenu=banner', displayText: undefined },
    },
    {
      bounds: { x: 0, y: 487, width: 414, height: 323 },
      action: { type: 'message', text: 'ขอดูกำหนดการงานแต่งค่ะ' },
    },
    {
      bounds: { x: 414, y: 487, width: 371, height: 323 },
      action: { type: 'uri', label: 'สถานที่จัดงาน', uri: MAPS_URL },
    },
    {
      // postback ไม่ใช่ message: webhook แยกเคสนี้ได้ชัดโดยไม่ต้อง match ข้อความ
      // และตอบด้วยการ์ดสอนวิธีคุยแทนที่จะยิงเข้า Gemini. ค่า data ต้องตรงกับ
      // POSTBACK.chat ใน apps/api/src/line/flex/theme.ts
      bounds: { x: 785, y: 487, width: 415, height: 323 },
      action: {
        type: 'postback',
        data: 'richmenu=chat',
        displayText: 'คุยกับน้องมายมิ้นท์',
      },
    },
  ],
};

function loadAccessToken() {
  if (process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()) {
    return process.env.LINE_CHANNEL_ACCESS_TOKEN.trim();
  }

  const envPath = join(REPO_ROOT, 'apps/api/.env');
  if (!existsSync(envPath)) {
    fail(
      'LINE_CHANNEL_ACCESS_TOKEN not set and apps/api/.env not found.\n' +
        'Run with: LINE_CHANNEL_ACCESS_TOKEN=xxx node scripts/setup-richmenu.mjs',
    );
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*LINE_CHANNEL_ACCESS_TOKEN\s*=\s*(.*)$/);
    if (match) {
      const value = match[1].trim().replace(/^["']|["']$/g, '');
      if (value && !value.startsWith('your-')) return value;
    }
  }

  return fail('LINE_CHANNEL_ACCESS_TOKEN missing or still a placeholder in apps/api/.env');
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

async function lineFetch(url, { method = 'GET', json, body, contentType, tolerate = [] } = {}) {
  const headers = { Authorization: `Bearer ${TOKEN}` };
  if (json) headers['Content-Type'] = 'application/json';
  if (contentType) headers['Content-Type'] = contentType;

  const res = await fetch(url, {
    method,
    headers,
    body: json ? JSON.stringify(json) : body,
  });

  const text = await res.text();
  if (!res.ok) {
    if (tolerate.includes(res.status)) return null;
    fail(`${method} ${url}\n  HTTP ${res.status}\n  ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

/**
 * LINE caps rich menu images at 1 MB. The source PNG is larger, so hand it to
 * sips (preinstalled on macOS) and ship a JPEG instead. Quality 92 keeps the
 * gold lettering clean while landing well under the cap.
 */
function prepareImage(path) {
  const bytes = statSync(path).size;
  if (bytes <= MAX_IMAGE_BYTES) {
    return { path, contentType: path.endsWith('.png') ? 'image/png' : 'image/jpeg' };
  }

  const out = join(tmpdir(), `${basename(path, '.png')}-richmenu.jpg`);
  console.log(`• image is ${(bytes / 1024 / 1024).toFixed(2)} MB (limit 1 MB) — converting to JPEG`);

  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', path, '--out', out], {
      stdio: 'ignore',
    });
  } catch {
    fail(
      'Could not compress the image (sips unavailable).\n' +
        `Compress it manually to under 1 MB, then point this script at it:\n` +
        `  magick "${path}" -quality 92 richmenu.jpg`,
    );
  }

  const outBytes = statSync(out).size;
  if (outBytes > MAX_IMAGE_BYTES) {
    fail(`Compressed image is still ${(outBytes / 1024 / 1024).toFixed(2)} MB — lower the quality`);
  }
  console.log(`• compressed to ${(outBytes / 1024).toFixed(0)} KB → ${out}`);
  return { path: out, contentType: 'image/jpeg' };
}

function validate() {
  const { width, height } = RICH_MENU.size;
  const ratio = width / height;

  if (![2500, 1200, 800].includes(width)) {
    fail(`width ${width} is not one of LINE's accepted widths (2500 / 1200 / 800)`);
  }
  if (height < 250) fail(`height ${height} is below LINE's 250 px minimum`);
  if (ratio < 1.45) fail(`aspect ratio ${ratio.toFixed(3)} is below LINE's 1.45 minimum`);

  for (const { bounds } of RICH_MENU.areas) {
    if (bounds.x < 0 || bounds.y < 0) fail(`area at ${JSON.stringify(bounds)} has a negative origin`);
    if (bounds.x + bounds.width > width || bounds.y + bounds.height > height) {
      fail(`area ${JSON.stringify(bounds)} spills outside the ${width}x${height} canvas`);
    }
  }
  console.log(`• ${RICH_MENU.areas.length} areas validated against ${width}x${height}`);
}

async function listMenus() {
  const { richmenus = [] } = await lineFetch(`${API}/richmenu/list`);
  // 404 here simply means no default has been assigned yet
  const current = await lineFetch(`${API}/user/all/richmenu`, { tolerate: [404] });
  const defaultId = current?.richMenuId ?? null;

  if (!richmenus.length) {
    console.log('• no rich menus registered on this OA');
    return [];
  }
  for (const menu of richmenus) {
    const mark = menu.richMenuId === defaultId ? ' (default)' : '';
    console.log(`  - ${menu.richMenuId}  "${menu.name}"  ${menu.size.width}x${menu.size.height}${mark}`);
  }
  return richmenus;
}

const TOKEN = process.argv.includes('--dry-run') ? 'dry-run' : loadAccessToken();

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    console.log('Rich menus on this OA:');
    await listMenus();
    return;
  }

  validate();

  if (args.includes('--dry-run')) {
    console.log('\nPayload that would be sent to POST /v2/bot/richmenu:\n');
    console.log(JSON.stringify(withoutEmptyActions(), null, 2));
    return;
  }

  const image = prepareImage(IMAGE_PATH);
  const existing = args.includes('--replace') ? await listMenus() : [];

  const { richMenuId } = await lineFetch(`${API}/richmenu`, {
    method: 'POST',
    json: withoutEmptyActions(),
  });
  console.log(`• created rich menu ${richMenuId}`);

  await lineFetch(`${API_DATA}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    body: readFileSync(image.path),
    contentType: image.contentType,
  });
  console.log('• image uploaded');

  await lineFetch(`${API}/user/all/richmenu/${richMenuId}`, { method: 'POST' });
  console.log('• set as the default rich menu for every friend');

  for (const menu of existing) {
    if (menu.richMenuId === richMenuId) continue;
    await lineFetch(`${API}/richmenu/${menu.richMenuId}`, { method: 'DELETE' });
    console.log(`• deleted old rich menu ${menu.richMenuId} ("${menu.name}")`);
  }

  console.log(
    '\n✓ Done. Reopen the chat in LINE to see it — the app caches the old menu for a minute or two.\n',
  );
}

/** A postback action with no displayText is how we express "tap does nothing". */
function withoutEmptyActions() {
  return {
    ...RICH_MENU,
    areas: RICH_MENU.areas.map(({ bounds, action }) => ({
      bounds,
      action: Object.fromEntries(Object.entries(action).filter(([, v]) => v !== undefined)),
    })),
  };
}

await main();
