'use client';

import { useState } from 'react';
import {
  Heart,
  Leaf,
  Loader2,
  Minus,
  PartyPopper,
  Phone,
  Plus,
  Users,
} from 'lucide-react';
import { submitRsvp } from '@/lib/api';
import { useWeddingConfig } from '@/components/WeddingSettingsProvider';
import { JoinNextStepCta } from '@/components/join/JoinNextStepCta';
import { useInvite, useInviteMessages } from '@/components/invite/InviteContext';
import { fillTemplate } from '@/lib/i18n';

interface StepAttendingProps {
  guestName: string;
  showNameHint?: boolean;
}

export function StepAttending({ guestName, showNameHint = false }: StepAttendingProps) {
  const config = useWeddingConfig();
  const { inviteToken, markRsvpComplete } = useInvite();
  const messages = useInviteMessages();
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function adjustCount(delta: number) {
    setAttendeeCount((prev) => Math.min(20, Math.max(1, prev + delta)));
    setError('');
  }

  async function handleConfirm() {
    if (attendeeCount < 1) {
      setError(messages.rsvpAttending.countError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitRsvp({
        name: guestName,
        attending: true,
        attendeeCount,
        ...(inviteToken && { inviteToken }),
      });
      if (inviteToken) markRsvpComplete(true);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  }

  if (!submitted) {
    return (
      <div className="min-w-0 text-center">
        <PartyPopper className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden />

        <h2 className="font-display text-[1.65rem] leading-tight text-teal-dark">
          {messages.rsvpAttending.delighted}
        </h2>

        <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
          ✦
        </p>

        <div className="relative mb-5">
          {showNameHint && (
            <span className="absolute -top-1 right-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.65rem] font-medium text-white shadow-md">
              ④
            </span>
          )}
          <p className="font-thai text-xs text-text-light">{messages.rsvpAttending.thanksPrefix}</p>
          <p className="mt-1 font-display text-[1.5rem] leading-tight text-teal-dark sm:text-[1.65rem]">
            {guestName}
          </p>
          <p className="mt-1 font-thai text-sm text-teal-dark">{messages.rsvpAttending.willJoin}</p>
        </div>

        <div className="mb-4 rounded-2xl border border-sage-pale/70 bg-[#F3EDE4] px-4 py-4 text-left">
          <label className="mb-3 flex items-center justify-center gap-2 font-thai text-sm font-semibold text-teal-dark">
            <Users className="h-4 w-4 text-gold" strokeWidth={1.6} aria-hidden />
            {messages.rsvpAttending.countLabel}
          </label>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => adjustCount(-1)}
              disabled={attendeeCount <= 1 || submitting}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sage-pale bg-white text-teal-dark transition-colors hover:border-sage disabled:opacity-40"
              aria-label="ลดจำนวน"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min={1}
              max={20}
              value={attendeeCount}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                if (Number.isNaN(value)) return;
                setAttendeeCount(Math.min(20, Math.max(1, value)));
                setError('');
              }}
              className="w-16 rounded-xl border border-sage-pale bg-white py-2 text-center font-display text-2xl text-teal-dark outline-none focus:border-sage"
              disabled={submitting}
            />

            <button
              type="button"
              onClick={() => adjustCount(1)}
              disabled={attendeeCount >= 20 || submitting}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sage-pale bg-white text-teal-dark transition-colors hover:border-sage disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-center font-thai text-[0.68rem] leading-relaxed text-text-light">
            {messages.rsvpAttending.countHint.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-sage px-4 py-3 font-thai text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {messages.rsvpAttending.saving}
            </>
          ) : (
            messages.rsvpAttending.confirm
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 text-center">
      <PartyPopper className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden />

      <h2 className="font-display text-[1.65rem] leading-tight text-teal-dark">
        {messages.rsvpAttending.thankYouTitle}
      </h2>

      <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
        ✦
      </p>

      <div className="relative mb-4">
        <p className="font-thai text-xs text-text-light">{messages.rsvpAttending.gladPrefix}</p>
        <p className="mt-1 font-display text-[1.6rem] leading-tight text-teal-dark sm:text-[1.75rem]">
          {guestName}
        </p>
        <p className="mt-1.5 inline-flex items-center justify-center gap-1.5 font-thai text-sm text-teal-dark">
          {fillTemplate(messages.rsvpAttending.willJoinCount, { count: attendeeCount })}
          <Heart className="h-3.5 w-3.5 text-sage" strokeWidth={1.8} aria-hidden />
        </p>
      </div>

      <JoinNextStepCta inviteToken={inviteToken} variant="light" />

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-sage-pale/50 bg-white/70 p-3 text-left">
        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.6} aria-hidden />
        <p className="font-thai text-[0.68rem] leading-relaxed text-text-light">
          {messages.rsvpAttending.lineContactNote}
          <br />
          {config.groomNickname} :{' '}
          <a
            href={`tel:${config.rsvpContactPhone}`}
            className="font-semibold text-teal-dark underline-offset-2 transition-colors hover:text-sage hover:underline"
          >
            {config.rsvpContactPhone}
          </a>
        </p>
      </div>

      <p className="mt-3 inline-flex items-center gap-1 text-[0.5rem] text-gold-light/70" aria-hidden>
        <Leaf className="h-2.5 w-2.5" strokeWidth={1.5} />
        ✦
        <Leaf className="h-2.5 w-2.5 scale-x-[-1]" strokeWidth={1.5} />
      </p>
    </div>
  );
}
