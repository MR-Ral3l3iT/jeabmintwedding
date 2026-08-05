'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
  getInviteMessages,
  normalizeInviteLocale,
  type InviteLocale,
  type InviteMessages,
} from '@/lib/i18n';
import type { InviteInfo } from '@/types';

export interface InviteContextValue {
  inviteToken?: string;
  invite?: InviteInfo;
  locale: InviteLocale;
  messages: InviteMessages;
  showNameHints?: boolean;
  envelopeOpened: boolean;
  setEnvelopeOpened: (opened: boolean) => void;
  markRsvpComplete: (attending: boolean) => void;
}

const InviteContext = createContext<InviteContextValue>({
  locale: 'TH',
  messages: getInviteMessages('TH'),
  envelopeOpened: false,
  setEnvelopeOpened: () => {},
  markRsvpComplete: () => {},
});

export function InviteProvider({
  children,
  inviteToken,
  invite,
  showNameHints,
  locale: localeProp,
}: {
  children: React.ReactNode;
  inviteToken?: string;
  invite?: InviteInfo;
  showNameHints?: boolean;
  locale?: InviteLocale | string;
}) {
  const [envelopeOpened, setEnvelopeOpenedState] = useState(false);
  const [inviteState, setInviteState] = useState<InviteInfo | undefined>(invite);

  useEffect(() => {
    setInviteState(invite);
  }, [invite]);

  const setEnvelopeOpened = useCallback((opened: boolean) => {
    setEnvelopeOpenedState(opened);
  }, []);

  const markRsvpComplete = useCallback((attending: boolean) => {
    setInviteState((prev) => (prev ? { ...prev, hasRsvp: true, attending } : prev));
  }, []);

  const locale = normalizeInviteLocale(
    localeProp ?? inviteState?.locale ?? invite?.locale,
  );
  const messages = useMemo(() => getInviteMessages(locale), [locale]);

  return (
    <InviteContext.Provider
      value={{
        inviteToken,
        invite: inviteState,
        locale,
        messages,
        showNameHints,
        envelopeOpened,
        setEnvelopeOpened,
        markRsvpComplete,
      }}
    >
      {children}
    </InviteContext.Provider>
  );
}

export function useInvite() {
  return useContext(InviteContext);
}

export function useInviteMessages(): InviteMessages {
  return useContext(InviteContext).messages;
}
