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

export type PartySide = 'GROOM' | 'BRIDE';
export type InviteLocale = 'TH' | 'EN';

export interface Guest {
  id: string;
  displayName?: string;
  name?: string;
  categoryId?: string;
  categoryName?: string;
  partySide?: PartySide;
  locale?: InviteLocale;
  attending?: boolean;
  attendeeCount?: number;
  createdAt: string;
  rsvpAt?: string;
  inviteToken?: string;
  lineUserId?: string;
  wishMessage?: string;
}

export interface LineFriend {
  id: string;
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  followedAt: string;
  unfollowedAt?: string;
  guestId?: string;
  guestDisplayName?: string;
  guestName?: string;
  guestPartySide?: PartySide;
  isFollowing: boolean;
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
  locale?: InviteLocale;
}

export interface JoinGuestInfo {
  displayName?: string;
  name?: string;
  partySide?: PartySide;
  inviteToken: string;
  locale?: InviteLocale;
}

export interface JoinPayload {
  name: string;
  partySide: PartySide;
  token?: string;
}

export interface JoinResponse {
  inviteToken: string;
  name: string;
  partySide: PartySide;
  lineOaUrl: string;
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
  groomBio?: string;
  brideBio?: string;
  botKnowledge?: string;
  updatedAt: string;
}

export type UpdateWeddingSettingsPayload = Partial<
  Omit<WeddingSettings, 'updatedAt' | 'timeline'>
> & {
  timeline?: TimelineItem[];
};

/* ─── Bot Studio ─── */

export interface BotPersona {
  id: string;
  displayName: string;
  /** คำที่บอทใช้แทนตัวเองเวลาตอบ เช่น "มายมิ้นท์" */
  selfCallName: string;
  tone: string;
  languageNote: string;
  emojiPolicy: string;
  maxLength: number;
  doNotDo: string;
  whenUnknown: string;
  updatedAt: string;
}

export type UpdateBotPersonaPayload = Omit<BotPersona, 'id' | 'updatedAt'>;

export interface BotKnowledgeTopic {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BotBasicsPreview {
  brideName: string;
  brideNickname: string;
  groomName: string;
  groomNickname: string;
  brideBio?: string;
  groomBio?: string;
  weddingDate: string;
  venue: string;
  city: string;
  mapsUrl: string;
  rsvpDeadline: string;
  rsvpContactPhone: string;
  lineOaId: string;
  timeline: TimelineItem[];
  legacyBotKnowledge: string | null;
}

export interface BotLineUsage {
  configured: boolean;
  error: string | null;
  type: string | null;
  limit: number | null;
  used: number | null;
  remaining: number | null;
}

export interface BotGeminiUsage {
  today: {
    replies: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  month: {
    replies: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  recent: Array<{
    id: string;
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    createdAt: string;
    meta?: unknown;
  }>;
  billingNote: string;
  aiStudioUsageUrl: string;
}

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

export interface SeatingGuestBrief {
  id: string;
  displayName: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SeatingGroup {
  id: string;
  name: string;
  shortName: string;
  guestCategoryId?: string;
  customName?: string;
  color: string;
  sortOrder: number;
  tableCodes: string[];
}

export interface SeatingSpot {
  id: string;
  code: string;
  kind: 'TABLE' | 'FACILITY';
  label?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  groupId?: string;
  groupName?: string;
  groupShortName?: string;
  groupColor?: string;
  guests: SeatingGuestBrief[];
}

export interface SeatingPlan {
  spots: SeatingSpot[];
  groups: SeatingGroup[];
  unassignedGuests: SeatingGuestBrief[];
}
