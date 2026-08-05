import { en } from './en';
import { th } from './th';
import type { InviteLocale, InviteMessages } from './types';

export type { InviteLocale, InviteMessages } from './types';
export { formatWeddingDate } from './types';

const CATALOG: Record<InviteLocale, InviteMessages> = {
  TH: th,
  EN: en,
};

export function normalizeInviteLocale(value?: string | null): InviteLocale {
  return value === 'EN' ? 'EN' : 'TH';
}

export function getInviteMessages(locale?: string | null): InviteMessages {
  return CATALOG[normalizeInviteLocale(locale)];
}

export function fillTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
