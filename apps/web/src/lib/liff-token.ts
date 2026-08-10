const LIFF_TOKEN_STORAGE_KEY = 'liff_invite_token';

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
  } catch {
    // ignore
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Invite token can arrive as a route param, ?token=, inside LIFF's liff.state,
 * or only in storage after an OAuth round trip. Check every source.
 */
export function resolveLiffInviteToken(explicitToken?: string | null): string | null {
  const candidates: (string | undefined | null)[] = [explicitToken];

  if (typeof window !== 'undefined') {
    const search = new URLSearchParams(window.location.search);
    candidates.push(search.get('token'));

    const liffState = search.get('liff.state');
    if (liffState) {
      const decoded = safeDecode(liffState);
      const [statePath, stateQuery] = decoded.split('?');
      if (stateQuery) {
        candidates.push(new URLSearchParams(stateQuery).get('token'));
      }
      const statePart = statePath.split('/').filter(Boolean).pop();
      if (statePart) candidates.push(statePart);
    }

    const parts = window.location.pathname.split('/').filter(Boolean);
    const linkIdx = parts.indexOf('link');
    if (linkIdx >= 0 && parts[linkIdx + 1]) {
      candidates.push(parts[linkIdx + 1]);
    }
  }

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value || value === 'link') continue;
    const decoded = safeDecode(value);
    persistLiffInviteToken(decoded);
    return decoded;
  }

  return readStoredLiffInviteToken();
}
