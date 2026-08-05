import { API_URL } from './constants';
import type {
  RsvpPayload,
  RsvpResponse,
  LoginPayload,
  LoginResponse,
  GuestListResponse,
  Guest,
  GuestCategory,
  LineFriend,
  InviteInfo,
  JoinGuestInfo,
  JoinPayload,
  JoinResponse,
  Wish,
  Stats,
  WeddingSettings,
  UpdateWeddingSettingsPayload,
} from '@/types';

function formatValidationString(raw: string): string {
  if (raw.includes('must be a string') || raw.includes('should not be empty')) {
    return 'กรุณากรอกชื่อบนการ์ด';
  }
  if (raw.includes('shorter than or equal to')) {
    return 'ชื่อยาวเกิน 150 ตัวอักษร';
  }
  return raw;
}

function pickBestValidationMessage(messages: string[]): string {
  const required = messages.find(
    (m) =>
      m.includes('กรุณากรอก') ||
      m.includes('must be a string') ||
      m.includes('should not be empty'),
  );
  if (required) return required;

  const thai = messages.find((m) => /[\u0E00-\u0E7F]/.test(m));
  return thai ?? messages[0] ?? 'ข้อมูลไม่ถูกต้อง';
}

function formatApiErrorMessage(raw: unknown): string {
  if (typeof raw === 'string') {
    return formatValidationString(raw);
  }

  if (Array.isArray(raw)) {
    const messages = raw.map((item) => formatApiErrorMessage(item));
    return pickBestValidationMessage(messages);
  }

  if (raw && typeof raw === 'object') {
    if ('constraints' in raw) {
      const constraints = (raw as { constraints?: Record<string, string> }).constraints;
      if (constraints) {
        const messages = Object.values(constraints).map((m) => formatValidationString(m));
        return pickBestValidationMessage(messages);
      }
    }
    if ('message' in raw) {
      return formatApiErrorMessage((raw as { message: unknown }).message);
    }
  }

  return 'เกิดข้อผิดพลาด';
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'เกิดข้อผิดพลาด' }));
    let message = formatApiErrorMessage(error.message ?? error);

    if (res.status === 401) {
      message = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function getInvite(token: string): Promise<InviteInfo> {
  return request<InviteInfo>(`/invite/${token}`);
}

export async function submitRsvp(payload: RsvpPayload): Promise<RsvpResponse> {
  return request<RsvpResponse>('/rsvp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getJoinGuest(token: string): Promise<JoinGuestInfo> {
  return request<JoinGuestInfo>(`/join/${token}`);
}

export async function submitJoin(payload: JoinPayload): Promise<JoinResponse> {
  return request<JoinResponse>('/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogin(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminStats(token: string): Promise<Stats> {
  return request<Stats>('/admin/guests/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminGuests(
  token: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    attending?: boolean;
    status?: 'pending' | 'attending' | 'declined' | 'responded';
    categoryId?: string;
    sort?: 'created' | 'rsvp';
  },
): Promise<GuestListResponse> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.attending !== undefined) qs.set('attending', String(params.attending));
  if (params.status) qs.set('status', params.status);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.sort) qs.set('sort', params.sort);

  return request<GuestListResponse>(`/admin/guests?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAdminGuest(
  token: string,
  payload: { displayName: string; categoryId: string },
): Promise<Guest> {
  return request<Guest>('/admin/guests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminGuest(
  token: string,
  id: string,
  payload: {
    displayName?: string;
    categoryId?: string;
    name?: string;
    partySide?: 'GROOM' | 'BRIDE';
  },
): Promise<Guest> {
  return request<Guest>(`/admin/guests/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ...(payload.displayName !== undefined && { displayName: payload.displayName.trim() }),
      ...(payload.categoryId !== undefined && { categoryId: payload.categoryId }),
      ...(payload.name !== undefined && { name: payload.name.trim() }),
      ...(payload.partySide !== undefined && { partySide: payload.partySide }),
    }),
  });
}

export async function getAdminGuestCategories(token: string): Promise<GuestCategory[]> {
  return request<GuestCategory[]>('/admin/guest-categories', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAdminGuestCategory(
  token: string,
  name: string,
): Promise<GuestCategory> {
  return request<GuestCategory>('/admin/guest-categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export async function updateAdminGuestCategory(
  token: string,
  id: string,
  payload: { name?: string; sortOrder?: number },
): Promise<GuestCategory> {
  return request<GuestCategory>(`/admin/guest-categories/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminGuestCategory(token: string, id: string): Promise<void> {
  return request<void>(`/admin/guest-categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminLineFriends(
  token: string,
  params: { linked?: 'all' | 'linked' | 'unlinked' } = {},
): Promise<LineFriend[]> {
  const qs = new URLSearchParams();
  if (params.linked) qs.set('linked', params.linked);
  const query = qs.toString();
  return request<LineFriend[]>(`/admin/line-friends${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function linkAdminLineFriend(
  token: string,
  id: string,
  guestId: string,
): Promise<LineFriend> {
  return request<LineFriend>(`/admin/line-friends/${id}/link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ guestId }),
  });
}

export async function unlinkAdminLineFriend(token: string, id: string): Promise<void> {
  return request<void>(`/admin/line-friends/${id}/link`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteAdminGuest(token: string, id: string): Promise<void> {
  return request<void>(`/admin/guests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminWishes(
  token: string,
  params: { limit?: number } = {},
): Promise<Wish[]> {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return request<Wish[]>(`/admin/wishes${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getWeddingSettings(): Promise<WeddingSettings> {
  return request<WeddingSettings>('/settings');
}

export async function getAdminSettings(token: string): Promise<WeddingSettings> {
  return request<WeddingSettings>('/admin/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateAdminSettings(
  token: string,
  payload: UpdateWeddingSettingsPayload,
): Promise<WeddingSettings> {
  return request<WeddingSettings>('/admin/settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function uploadPaymentQr(
  token: string,
  file: File,
): Promise<WeddingSettings> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/admin/settings/payment-qr`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'อัปโหลดไม่สำเร็จ' }));
    let message = formatApiErrorMessage(error.message ?? error);
    if (res.status === 401) {
      message = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
    }
    throw new Error(message);
  }

  return res.json() as Promise<WeddingSettings>;
}
