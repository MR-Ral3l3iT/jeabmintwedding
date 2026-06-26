'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { InviteInfo } from '@/types';

export interface InviteContextValue {
  inviteToken?: string;
  invite?: InviteInfo;
  showNameHints?: boolean;
  envelopeOpened: boolean;
  setEnvelopeOpened: (opened: boolean) => void;
  markRsvpComplete: (attending: boolean) => void;
}

const InviteContext = createContext<InviteContextValue>({
  envelopeOpened: false,
  setEnvelopeOpened: () => {},
  markRsvpComplete: () => {},
});

export function InviteProvider({
  children,
  inviteToken,
  invite,
  showNameHints,
}: {
  children: React.ReactNode;
  inviteToken?: string;
  invite?: InviteInfo;
  showNameHints?: boolean;
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

  return (
    <InviteContext.Provider
      value={{
        inviteToken,
        invite: inviteState,
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
