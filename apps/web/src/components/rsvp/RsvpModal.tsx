'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { StepOne } from './StepOne';
import { StepAttending } from './StepAttending';
import { StepDeclined } from './StepDeclined';
import { submitRsvp } from '@/lib/api';
import { useInvite } from '@/components/invite/InviteContext';
import { ASSETS } from '@/lib/constants';

type Step = 'step1' | 'attending' | 'declined';

function ModalFlorals() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.flowers.f05}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-[36%] z-0 w-[min(34vw,110px)] max-w-none -translate-x-[38%] opacity-75"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.flowers.f05}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-[36%] z-0 w-[min(34vw,110px)] max-w-none translate-x-[38%] scale-x-[-1] opacity-75"
        draggable={false}
      />
    </>
  );
}

export function RsvpModal() {
  const { inviteToken, invite, showNameHints, markRsvpComplete } = useInvite();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('step1');
  const [guestName, setGuestName] = useState('');

  const defaultName = invite?.displayName ?? '';

  const handleOpen = useCallback(() => {
    if (inviteToken && invite?.hasRsvp) return;
    setStep('step1');
    setGuestName(defaultName);
    setOpen(true);
  }, [defaultName, inviteToken, invite?.hasRsvp]);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.addEventListener('open-rsvp-modal', handleOpen);
    return () => window.removeEventListener('open-rsvp-modal', handleOpen);
  }, [handleOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  async function handleChoose(name: string, attending: boolean) {
    setGuestName(name);
    if (attending) {
      setStep('attending');
      return;
    }
    try {
      await submitRsvp({
        name,
        attending: false,
        ...(inviteToken && { inviteToken }),
      });
      if (inviteToken) markRsvpComplete(false);
    } catch {
      // continue to show next step even on error
    }
    setStep('declined');
  }

  if (!open || !mounted) return null;

  const alreadyRsvp = invite?.hasRsvp;
  const showFlorals = !alreadyRsvp && (step === 'step1' || step === 'declined' || step === 'attending');

  const overlay = (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="ตอบรับหรือฝากคำอวยพร"
        className="absolute left-1/2 top-1/2 box-border w-[min(calc(100vw-2rem),28rem)] min-w-0 max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 animate-[rsvpModalIn_0.35s_ease-out]"
      >
        <style>{`
          @keyframes rsvpModalIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        <div className="relative max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border border-sage-pale bg-cream shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
          {showFlorals && <ModalFlorals />}

          <div className="relative z-10 max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-6 sm:px-5">
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 shrink-0 text-text-light transition-colors hover:text-text"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="min-w-0">
              {alreadyRsvp ? (
                <div className="text-center">
                  <h2 className="mb-2 font-display text-[1.75rem] text-teal-dark">ตอบรับแล้วค่ะ</h2>
                  <p className="text-sm text-text-light">
                    {invite?.attending
                      ? 'ขอบคุณที่ยืนยันเข้าร่วมงานนะคะ 💚'
                      : 'ขอบคุณที่แจ้งให้ทราบนะคะ 🌿'}
                  </p>
                </div>
              ) : (
                <>
                  {step === 'step1' && (
                    <StepOne
                      defaultName={defaultName}
                      lockName={!!inviteToken}
                      showNameHint={showNameHints}
                      onChoose={handleChoose}
                    />
                  )}
                  {step === 'attending' && (
                    <StepAttending guestName={guestName} showNameHint={showNameHints} />
                  )}
                  {step === 'declined' && (
                    <StepDeclined guestName={guestName} onClose={handleClose} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
