#!/usr/bin/env node
/**
 * Print the Flex bubbles the bot sends, so they can be pasted into
 * https://developers.line.biz/flex-simulator/ and checked without a real send.
 *
 * Reads the compiled builders from apps/api/dist, so build the API first:
 *   npm run build --workspace=apps/api && npm run line:flex:preview
 *
 * Sample data below only feeds the preview. The bot itself pulls the real values
 * from WeddingSettings and BotPersona.
 *
 * Usage:
 *   node scripts/preview-flex.mjs            # both cards
 *   node scripts/preview-flex.mjs welcome    # just the welcome card
 *   node scripts/preview-flex.mjs hint       # just the how-to-chat card
 */

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(REPO_ROOT, 'apps/api/dist/line/flex');

if (!existsSync(join(DIST, 'welcome.flex.js'))) {
  console.error(
    '\n✗ apps/api/dist not found — run: npm run build --workspace=apps/api\n',
  );
  process.exit(1);
}

const { buildWelcomeFlex } = await import(
  pathToFileURL(join(DIST, 'welcome.flex.js')).href
);
const { buildChatHintFlex } = await import(
  pathToFileURL(join(DIST, 'chat-hint.flex.js')).href
);

const SAMPLE_SETTINGS = {
  brideNickname: 'เจี๊ยบ',
  groomNickname: 'มิ้นท์',
  weddingDate: '2026-10-31T07:00:00.000Z',
  venue: 'กรมยุทธบริการทหาร กองบัญชาการกองทัพไทย',
  rsvpDeadline: '2026-10-14T00:00:00.000Z',
};

const SAMPLE_PROFILE = {
  displayName: 'สมหญิง',
  // ปล่อย null เพื่อดูแบบไม่มีรูป (fallback เป็นอักษรตัวแรก)
  pictureUrl: 'https://profile.line-scdn.net/0hsample',
};

const CARDS = {
  welcome: () =>
    buildWelcomeFlex(SAMPLE_PROFILE, SAMPLE_SETTINGS, 'น้องมายมิ้นท์'),
  hint: () => buildChatHintFlex('น้องมายมิ้นท์', 'มายมิ้นท์', 30),
};

const wanted = process.argv[2];
const names = wanted ? [wanted] : Object.keys(CARDS);

for (const name of names) {
  const build = CARDS[name];
  if (!build) {
    console.error(`\n✗ unknown card "${name}" — try: ${Object.keys(CARDS).join(', ')}\n`);
    process.exit(1);
  }
  // Heading goes to stderr so stdout stays pure JSON:
  //   node scripts/preview-flex.mjs welcome | pbcopy
  console.error(`\n──────── ${name} ────────`);
  // The simulator takes the bubble, not the message wrapper.
  console.log(JSON.stringify(build().contents, null, 2));
}
