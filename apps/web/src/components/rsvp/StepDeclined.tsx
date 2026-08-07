'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Banknote, Check, Clipboard, Heart, Leaf, Mail } from 'lucide-react';
import { submitRsvp } from '@/lib/api';
import { useWeddingConfig } from '@/components/WeddingSettingsProvider';
import { useInviteMessages } from '@/components/invite/InviteContext';
import { fillTemplate } from '@/lib/i18n';

interface StepDeclinedProps {
  guestName: string;
  onClose: () => void;
}

type Tab = 'wish' | 'pay';

function GoldDivider() {
  return (
    <div className="my-3 flex items-center justify-center text-gold">
      <span className="text-[0.5rem]">✦</span>
    </div>
  );
}

export function StepDeclined({ guestName, onClose }: StepDeclinedProps) {
  const config = useWeddingConfig();
  const messages = useInviteMessages();
  const [activeTab, setActiveTab] = useState<Tab>('wish');
  const [wishText, setWishText] = useState('');
  const [wishSent, setWishSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<'pp' | 'bank' | null>(null);

  const coupleNames = `${config.brideNickname} & ${config.groomNickname}`;

  async function handleSendWish() {
    if (!wishText.trim()) return;
    setSubmitting(true);
    try {
      await submitRsvp({ name: guestName, attending: false, wish: wishText.trim() });
      setWishSent(true);
    } catch {
      setWishSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(value: string, type: 'pp' | 'bank') {
    try {
      await navigator.clipboard.writeText(value.replace(/-/g, ''));
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="min-w-0 text-center">
      <div className="relative mb-2 inline-flex items-center justify-center" aria-hidden>
        <Heart className="h-5 w-5 text-gold" strokeWidth={1.6} />
        <Leaf className="absolute -right-2 -top-1 h-3 w-3 text-gold/80" strokeWidth={1.5} />
      </div>

      <h2 className="font-display text-[1.65rem] leading-tight text-teal-dark">
        {messages.rsvpDeclined.title}
      </h2>

      <GoldDivider />

      <p className="mb-4 font-thai text-xs leading-relaxed text-text-light">
        {messages.rsvpDeclined.intro}
        <br />
        <span className="mt-1.5 block text-base font-semibold text-teal-dark sm:text-[1.05rem]">
          {coupleNames}
        </span>
      </p>

      {wishSent ? (
        <div className="rounded-xl border border-sage-pale/70 bg-[#F3EDE4] p-5 text-center">
          <Mail className="mx-auto mb-2 h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden />
          <h3 className="font-display text-[1.5rem] text-teal-dark">{messages.rsvpDeclined.sentTitle}</h3>
          <p className="mt-1 font-thai text-sm text-text-light">
            {messages.rsvpDeclined.sentBody.split('{names}').map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <span className="font-semibold text-teal-dark">{coupleNames}</span>
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
          <button
            onClick={onClose}
            className="mt-4 rounded-full bg-sage px-6 py-2.5 font-thai text-sm font-medium text-gold-light"
          >
            {messages.rsvpDeclined.close}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('wish')}
              className={[
                'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 font-thai text-[0.8rem] font-medium transition-colors sm:text-sm',
                activeTab === 'wish'
                  ? 'bg-sage text-white'
                  : 'border border-sage-pale bg-white text-text-light hover:bg-sage-pale/40',
              ].join(' ')}
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden />
              {messages.rsvpDeclined.tabWish}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pay')}
              className={[
                'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 font-thai text-[0.8rem] font-medium transition-colors sm:text-sm',
                activeTab === 'pay'
                  ? 'bg-sage text-white'
                  : 'border border-sage-pale bg-white text-text-light hover:bg-sage-pale/40',
              ].join(' ')}
            >
              <Banknote className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden />
              {messages.rsvpDeclined.tabPay}
            </button>
          </div>

          {activeTab === 'wish' && (
            <div className="text-left">
              <label className="mb-1.5 flex items-center gap-1.5 font-thai text-xs text-text-light">
                <Leaf className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
                {fillTemplate(messages.rsvpDeclined.wishLabel, { names: coupleNames })}
              </label>
              <div className="relative">
                <textarea
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder={messages.rsvpDeclined.wishPlaceholder}
                  maxLength={300}
                  rows={4}
                  className="box-border w-full resize-y rounded-xl border border-sage-pale bg-white px-3.5 py-3 pb-7 font-thai text-sm text-text outline-none transition-colors focus:border-sage"
                />
                <p className="pointer-events-none absolute bottom-2.5 right-3 font-thai text-[0.65rem] text-text-light/70">
                  {wishText.length}/300
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendWish}
                disabled={submitting || !wishText.trim()}
                className="relative mt-4 flex w-full items-center justify-center rounded-full bg-sage px-4 py-3.5 font-thai text-sm font-medium text-gold-light transition-all hover:bg-teal-dark disabled:opacity-50"
              >
                <span className="absolute left-4 text-[0.5rem] text-gold-light/70" aria-hidden>
                  ✦
                </span>
                <span className="flex items-center gap-2">
                  {submitting ? messages.rsvpDeclined.sending : messages.rsvpDeclined.sendWish}
                  {!submitting && <Mail className="h-4 w-4" strokeWidth={1.8} aria-hidden />}
                </span>
                <span className="absolute right-4 text-[0.5rem] text-gold-light/70" aria-hidden>
                  ✦
                </span>
              </button>
            </div>
          )}

          {activeTab === 'pay' && (
            <div className="rounded-xl border border-sage-pale/70 bg-white p-4 text-center">
              <h3 className="mb-4 font-thai text-sm font-semibold text-teal-dark">
                {config.bankAccountNumber
                  ? messages.rsvpDeclined.transferBank
                  : messages.rsvpDeclined.transferPromptpay}
              </h3>

              <div className="mb-4 inline-block rounded-xl border-2 border-sage-pale p-4">
                {config.paymentQrUrl ? (
                  <Image
                    src={config.paymentQrUrl}
                    alt="QR Code ชำระเงิน"
                    width={140}
                    height={140}
                    className="h-[140px] w-[140px] object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-[140px] w-[140px] items-center justify-center rounded-lg bg-sage-pale/30 p-3 text-center text-xs text-text-light">
                    {messages.rsvpDeclined.noQr}
                  </div>
                )}
              </div>

              {config.bankAccountNumber ? (
                <>
                  {config.bankName && (
                    <p className="font-thai text-xs text-text-light">{config.bankName}</p>
                  )}
                  <p className="mt-1 font-mono text-[1.05rem] font-semibold tracking-[0.06em] text-teal-dark">
                    {config.bankAccountNumber}
                  </p>
                  {config.bankAccountName && (
                    <p className="mt-1 font-thai text-xs text-text-light">
                      {messages.rsvpDeclined.accountName}: {config.bankAccountName}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(config.bankAccountNumber, 'bank')}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-pale px-5 py-2 font-thai text-sm text-sage transition-all hover:bg-sage hover:text-white"
                  >
                    {copied === 'bank' ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                        {messages.rsvpDeclined.copied}
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                        {messages.rsvpDeclined.copyAccount}
                      </>
                    )}
                  </button>
                </>
              ) : (
                config.promptpay && (
                  <>
                    <p className="font-mono text-[1.05rem] font-semibold tracking-[0.1em] text-teal-dark">
                      {config.promptpay}
                    </p>
                    <p className="mt-1 font-thai text-xs text-text-light">
                      {messages.rsvpDeclined.accountName}:{' '}
                      {config.bankAccountName || config.promptpayName}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(config.promptpay, 'pp')}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-pale px-5 py-2 font-thai text-sm text-sage transition-all hover:bg-sage hover:text-white"
                    >
                      {copied === 'pp' ? (
                        <>
                          <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                          {messages.rsvpDeclined.copied}
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                          {messages.rsvpDeclined.copyPhone}
                        </>
                      )}
                    </button>
                  </>
                )
              )}

              <p className="mt-3 font-thai text-[0.72rem] leading-relaxed text-text-light">
                {messages.rsvpDeclined.payNote}
              </p>
            </div>
          )}

          <GoldDivider />

          <button
            type="button"
            onClick={onClose}
            className="font-thai text-sm text-text-light/80 transition-colors hover:text-text-light"
          >
            {messages.rsvpDeclined.done}
          </button>
        </>
      )}
    </div>
  );
}
