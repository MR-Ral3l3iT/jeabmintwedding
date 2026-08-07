import { createHmac, timingSafeEqual } from 'crypto';

export const BOT_STUDIO_COOKIE = 'bot_studio_session';
const SESSION_DAYS = 7;

function getSecret(): string {
  const secret = process.env.BOT_STUDIO_SECRET?.trim();
  if (!secret) {
    throw new Error('BOT_STUDIO_SECRET is not configured');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `ok.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [ok, expStr, signature] = parts;
  if (ok !== 'ok') return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const payload = `${ok}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseCookieHeader(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

export function sessionMaxAgeSeconds(): number {
  return SESSION_DAYS * 24 * 60 * 60;
}

export function buildSetCookie(token: string, clear = false): string {
  const isProd = process.env.NODE_ENV === 'production';
  // Cross-origin SPA → API needs None; Lax is fine for local same-site testing
  const sameSite = isProd ? 'None' : 'Lax';
  const secure = isProd ? '; Secure' : '';
  if (clear) {
    return `${BOT_STUDIO_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=${sameSite}${secure}`;
  }
  return `${BOT_STUDIO_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${sessionMaxAgeSeconds()}; HttpOnly; SameSite=${sameSite}${secure}`;
}
