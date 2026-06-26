'use client';

import { useState } from 'react';
import {
  ChevronRight,
  Heart,
  Leaf,
  Loader2,
  MessageCircle,
  Minus,
  PartyPopper,
  Phone,
  Plus,
  Users,
} from 'lucide-react';
import { submitRsvp } from '@/lib/api';
import { useWeddingConfig } from '@/components/WeddingSettingsProvider';
import { useInvite } from '@/components/invite/InviteContext';

interface StepAttendingProps {
  guestName: string;
  showNameHint?: boolean;
}

export function StepAttending({ guestName, showNameHint = false }: StepAttendingProps) {
  const config = useWeddingConfig();
  const { inviteToken, markRsvpComplete } = useInvite();
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
      setError('กรุณาระบุจำนวนผู้มางานอย่างน้อย 1 คน');
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

        <h2 className="font-display text-[1.65rem] leading-tight text-teal-dark">ยินดีมากค่ะ!</h2>

        <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
          ✦
        </p>

        <div className="relative mb-5">
          {showNameHint && (
            <span className="absolute -top-1 right-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.65rem] font-medium text-white shadow-md">
              ④
            </span>
          )}
          <p className="font-thai text-xs text-text-light">ขอบคุณที่</p>
          <p className="mt-1 font-display text-[1.5rem] leading-tight text-teal-dark sm:text-[1.65rem]">
            {guestName}
          </p>
          <p className="mt-1 font-thai text-sm text-teal-dark">จะมาร่วมงานกับเรา</p>
        </div>

        <div className="mb-4 rounded-2xl border border-sage-pale/70 bg-[#F3EDE4] px-4 py-4 text-left">
          <label className="mb-3 flex items-center justify-center gap-2 font-thai text-sm font-semibold text-teal-dark">
            <Users className="h-4 w-4 text-gold" strokeWidth={1.6} aria-hidden />
            จำนวนผู้มางาน (รวมท่าน)
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
            ช่วยระบุจำนวนคนที่มางานจริง <br /> เพื่อให้เราจัดเตรียมอาหารและที่นั่งได้พอดี
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
              กำลังบันทึก...
            </>
          ) : (
            'ยืนยันการเข้าร่วมงาน'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 text-center">
      <PartyPopper className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden />

      <h2 className="font-display text-[1.65rem] leading-tight text-teal-dark">ขอบคุณมากค่ะ!</h2>

      <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
        ✦
      </p>

      <div className="relative mb-4">
        <p className="font-thai text-xs text-text-light">เราดีใจมากที่</p>
        <p className="mt-1 font-display text-[1.6rem] leading-tight text-teal-dark sm:text-[1.75rem]">
          {guestName}
        </p>
        <p className="mt-1.5 inline-flex items-center justify-center gap-1.5 font-thai text-sm text-teal-dark">
          จะมาร่วมงานกับเรา {attendeeCount} ท่าน
          <Heart className="h-3.5 w-3.5 text-sage" strokeWidth={1.8} aria-hidden />
        </p>
      </div>

      <a
        href={config.lineOaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl bg-sage p-3.5 text-left shadow-[0_6px_20px_rgba(107,124,94,0.28)] transition-colors hover:bg-teal-dark sm:p-4"
      >
        <MessageCircle className="h-6 w-6 shrink-0 text-gold-light" strokeWidth={1.6} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-thai text-sm font-semibold text-white">เพิ่ม LINE OA</p>
          <p className="mt-0.5 font-thai text-[0.68rem] leading-relaxed text-white/80">
            เพื่อรับข้อมูลอัปเดตของงาน และแผนผังสถานที่จัดงาน
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          <ChevronRight className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
        </span>
      </a>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-sage-pale/50 bg-white/70 p-3 text-left">
        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.6} aria-hidden />
        <p className="font-thai text-[0.68rem] leading-relaxed text-text-light">
          ไม่สามารถ @line ได้ ติดต่อได้ที่เบอร์
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
