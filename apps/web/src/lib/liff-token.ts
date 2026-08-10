const LIFF_TOKEN_STORAGE_KEY = 'liff_invite_token';
const LIFF_HANDOFF_KEY = 'liff_external_handoff';

export function persistLiffInviteToken(token: string) {
  try {
    sessionStorage.setItem(LIFF_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(LIFF_TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export function readStoredLiffInviteToken(): string | null {
  try {
    return (
      sessionStorage.getItem(LIFF_TOKEN_STORAGE_KEY)?.trim() ||
      localStorage.getItem(LIFF_TOKEN_STORAGE_KEY)?.trim() ||
      null
    );
  } catch {
    return null;
  }
}

export function clearStoredLiffInviteToken() {
  try {
    sessionStorage.removeItem(LIFF_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LIFF_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(LIFF_HANDOFF_KEY);
  } catch {
    // ignore
  }
}

export function markLiffHandoffAttempted(token: string) {
  try {
    sessionStorage.setItem(LIFF_HANDOFF_KEY, token);
  } catch {
    // ignore
  }
}

export function wasLiffHandoffAttempted(token: string): boolean {
  try {
    return sessionStorage.getItem(LIFF_HANDOFF_KEY) === token;
  } catch {
    return false;
  }
}
