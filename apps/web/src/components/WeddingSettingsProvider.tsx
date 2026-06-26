'use client';

import { createContext, useContext } from 'react';
import { WEDDING } from '@/lib/constants';
import type { WeddingSettings } from '@/types';

type WeddingConfig = {
  groomName: string;
  groomNickname: string;
  brideName: string;
  brideNickname: string;
  weddingDate: Date;
  venue: string;
  city: string;
  lineOaId: string;
  lineOaUrl: string;
  rsvpContactPhone: string;
  mapsUrl: string;
  rsvpDeadline: Date;
  promptpay: string;
  promptpayName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  paymentQrUrl: string;
  timeline: { time: string; event: string }[];
};

const WeddingSettingsContext = createContext<WeddingConfig | null>(null);

export function mergeWeddingSettings(settings: WeddingSettings | null): WeddingConfig {
  const accountName =
    settings?.bankAccountName?.trim() ||
    settings?.promptpayName?.trim() ||
    WEDDING.promptpayName;

  return {
    groomName: settings?.groomName ?? WEDDING.groomName,
    groomNickname: settings?.groomNickname ?? WEDDING.groomNickname,
    brideName: settings?.brideName ?? WEDDING.brideName,
    brideNickname: settings?.brideNickname ?? WEDDING.brideNickname,
    weddingDate: settings?.weddingDate ? new Date(settings.weddingDate) : WEDDING.date,
    venue: settings?.venue ?? WEDDING.venue,
    city: settings?.city ?? WEDDING.city,
    lineOaId: settings?.lineOaId ?? WEDDING.lineOaId,
    lineOaUrl: settings?.lineOaUrl ?? WEDDING.lineOaUrl,
    rsvpContactPhone: settings?.rsvpContactPhone ?? WEDDING.rsvpContactPhone,
    mapsUrl: settings?.mapsUrl ?? WEDDING.mapsUrl,
    rsvpDeadline: settings?.rsvpDeadline
      ? new Date(settings.rsvpDeadline)
      : WEDDING.rsvpDeadline,
    promptpay: settings?.promptpay ?? WEDDING.promptpay,
    promptpayName: accountName,
    bankName: settings?.bankName ?? '',
    bankAccountNumber: settings?.bankAccountNumber ?? '',
    bankAccountName: accountName,
    paymentQrUrl: settings?.paymentQrUrl ?? '',
    timeline: settings?.timeline?.length ? settings.timeline : [...WEDDING.timeline],
  };
}

export function WeddingSettingsProvider({
  settings,
  children,
}: {
  settings: WeddingSettings | null;
  children: React.ReactNode;
}) {
  const value = mergeWeddingSettings(settings);
  return (
    <WeddingSettingsContext.Provider value={value}>{children}</WeddingSettingsContext.Provider>
  );
}

export function useWeddingConfig(): WeddingConfig {
  const ctx = useContext(WeddingSettingsContext);
  return ctx ?? mergeWeddingSettings(null);
}
