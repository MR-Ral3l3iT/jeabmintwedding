'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, QrCode } from 'lucide-react';
import { getJoinUrl } from '@/lib/constants';
import { useInviteMessages } from '@/components/invite/InviteContext';

interface JoinNextStepCtaProps {
  inviteToken?: string;
  variant?: 'light' | 'dark';
}

export function JoinNextStepCta({ inviteToken, variant = 'light' }: JoinNextStepCtaProps) {
  const messages = useInviteMessages();
  const [copied, setCopied] = useState(false);
  const joinUrl = getJoinUrl(inviteToken);
  const isDark = variant === 'dark';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={
        isDark
          ? 'mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center'
          : 'mt-1 rounded-2xl border border-sage-pale/60 bg-[#F3EDE4] p-4 text-center'
      }
    >
      <div
        className={
          isDark
            ? 'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10'
            : 'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80'
        }
      >
        <QrCode
          className={isDark ? 'h-5 w-5 text-gold-light' : 'h-5 w-5 text-gold'}
          strokeWidth={1.6}
          aria-hidden
        />
      </div>

      <p
        className={
          isDark
            ? 'font-thai text-sm font-semibold text-white'
            : 'font-thai text-sm font-semibold text-teal-dark'
        }
      >
        {messages.joinCta.title}
      </p>
      <p
        className={
          isDark
            ? 'mt-1 font-thai text-[0.68rem] leading-relaxed text-white/70'
            : 'mt-1 font-thai text-[0.68rem] leading-relaxed text-text-light'
        }
      >
        {messages.joinCta.body.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>

      <div className="mx-auto mt-4 inline-flex rounded-2xl bg-white p-3 shadow-sm">
        <QRCodeSVG value={joinUrl} size={148} level="M" includeMargin={false} />
      </div>

      <a
        href={joinUrl}
        className={
          isDark
            ? 'mt-4 inline-flex w-full items-center justify-center rounded-full bg-sage px-4 py-2.5 font-thai text-sm font-medium text-white transition-colors hover:bg-teal-dark'
            : 'mt-4 inline-flex w-full items-center justify-center rounded-full bg-sage px-4 py-2.5 font-thai text-sm font-medium text-white transition-colors hover:bg-teal-dark'
        }
      >
        {messages.joinCta.open}
      </a>

      <button
        type="button"
        onClick={() => void handleCopy()}
        className={
          isDark
            ? 'mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-thai text-[0.7rem] text-white/75 hover:bg-white/10'
            : 'mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-sage-pale px-4 py-2 font-thai text-[0.7rem] text-sage hover:bg-white/60'
        }
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? messages.joinCta.copied : messages.joinCta.copy}
      </button>
    </div>
  );
}
