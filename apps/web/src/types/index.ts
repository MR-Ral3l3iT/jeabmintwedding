export interface RsvpPayload {
  name: string;
  attending: boolean;
  attendeeCount?: number;
  wish?: string;
  inviteToken?: string;
}

export interface RsvpResponse {
  guestId: string;
  name: string;
  attending: boolean;
  attendeeCount?: number;
  wishId?: string;
}

export interface GuestCategory {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface Guest {
  id: string;
  displayName?: string;
  name?: string;
  categoryId?: string;
  categoryName?: string;
  attending?: boolean;
  attendeeCount?: number;
  createdAt: string;
  rsvpAt?: string;
  inviteToken?: string;
  wishMessage?: string;
}

export interface GuestListResponse {
  data: Guest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InviteInfo {
  displayName: string;
  hasRsvp: boolean;
  attending?: boolean;
}

export interface Wish {
  id: string;
  message: string;
  guestName: string;
  createdAt: string;
}

export interface Stats {
  attending: number;
  declined: number;
  totalWishes: number;
  totalGuests: number;
  pendingInvites?: number;
  totalAttendees?: number;
}

export interface TimelineItem {
  time: string;
  event: string;
}

export interface WeddingSettings {
  groomName: string;
  groomNickname: string;
  brideName: string;
  brideNickname: string;
  weddingDate: string;
  venue: string;
  city: string;
  lineOaId: string;
  lineOaUrl: string;
  rsvpContactPhone: string;
  mapsUrl: string;
  rsvpDeadline: string;
  promptpay?: string;
  promptpayName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  paymentQrUrl?: string;
  timeline: TimelineItem[];
  updatedAt: string;
}

export type UpdateWeddingSettingsPayload = Partial<
  Omit<WeddingSettings, 'updatedAt' | 'timeline'>
> & {
  timeline?: TimelineItem[];
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminEmail: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}
