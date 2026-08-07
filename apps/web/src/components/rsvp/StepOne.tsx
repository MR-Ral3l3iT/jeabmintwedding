'use client';

import { useState } from 'react';
import { Gem, Heart, Leaf, User } from 'lucide-react';
import { useInviteMessages } from '@/components/invite/InviteContext';

interface StepOneProps {
  defaultName?: string;
  lockName?: boolean;
  showNameHint?: boolean;
  onChoose: (name: string, attending: boolean) => Promise<void>;
}

function GoldDivider() {
  return (
    <div className="my-4 flex items-center gap-3 text-gold">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
      <span className="text-[0.5rem]">✦</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
    </div>
  );
}

export function StepOne({
  defaultName = '',
  lockName = false,
  showNameHint = false,
  onChoose,
}: StepOneProps) {
  const messages = useInviteMessages();
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChoose(attending: boolean) {
    if (!name.trim()) {
      setError(messages.rsvpStep1.nameRequired);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onChoose(name.trim(), attending);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 text-center">
      <Gem className="mx-auto mb-1 h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden />
      <h2 className="font-display text-[1.85rem] leading-tight text-teal-dark">
        {messages.rsvpStep1.title}
      </h2>

      <GoldDivider />

      <div className="relative mb-4 mt-1">
        {showNameHint && (
          <span className="absolute -top-2 right-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.65rem] font-medium text-white shadow-md">
            ③
          </span>
        )}

        {lockName ? (
          <div className="flex items-center gap-3 rounded-xl border border-sage-pale/70 bg-[#F3EDE4] px-4 py-3.5 text-left">
            <User className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.6} aria-hidden />
            <p className="min-w-0 flex-1 font-thai text-base font-semibold leading-snug text-teal-dark md:text-[1.05rem]">
              {name || defaultName}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-sage-pale/70 bg-[#F3EDE4] px-3.5 py-3 text-left">
            <label className="mb-1.5 flex items-center gap-2 font-thai text-sm font-semibold text-teal-dark">
              <User className="h-4 w-4 text-gold" strokeWidth={1.6} aria-hidden />
              {messages.rsvpStep1.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={messages.rsvpStep1.namePlaceholder}
              className={[
                'box-border w-full max-w-full rounded-lg border bg-white px-3 py-2.5 font-thai text-sm text-text',
                'outline-none transition-colors focus:border-sage',
                error ? 'border-red-400' : 'border-sage-pale',
              ].join(' ')}
              onKeyDown={(e) => e.key === 'Enter' && handleChoose(true)}
              disabled={loading}
              autoFocus
            />
          </div>
        )}
      </div>
      {error && <p className="-mt-2 mb-3 text-left text-xs text-red-500">{error}</p>}

      <div className="space-y-2.5">
        <button
          onClick={() => handleChoose(true)}
          disabled={loading}
          className="relative flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full bg-sage px-3 py-3 font-thai text-[0.82rem] font-medium text-white transition-all hover:bg-teal-dark disabled:opacity-50 sm:px-4 sm:text-sm"
        >
          <Leaf className="absolute left-3 h-3 w-3 opacity-55 sm:left-4 sm:h-3.5 sm:w-3.5" strokeWidth={1.5} aria-hidden />
          <Heart className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
          <span className="min-w-0">{messages.rsvpStep1.attend}</span>
          <Leaf className="absolute right-3 h-3 w-3 scale-x-[-1] opacity-55 sm:right-4 sm:h-3.5 sm:w-3.5" strokeWidth={1.5} aria-hidden />
        </button>
        <button
          onClick={() => handleChoose(false)}
          disabled={loading}
          className="relative flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-teal-dark/25 bg-white px-3 py-3 font-thai text-[0.82rem] font-medium text-teal-dark transition-all hover:bg-sage-pale/40 disabled:opacity-50 sm:px-4 sm:text-sm"
        >
          <Heart className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
          <span className="min-w-0">{messages.rsvpStep1.decline}</span>
        </button>
      </div>

      <GoldDivider />

      <div className="space-y-3 font-thai text-xs leading-relaxed text-text-light">
        <p>
          {messages.rsvpStep1.helpPrepare.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <p className="font-thai text-sm font-semibold leading-relaxed text-teal-dark">
          {messages.rsvpStep1.thankYou}{' '}
          <Heart className="inline h-3.5 w-3.5 align-[-2px] text-gold" strokeWidth={1.8} aria-hidden />
        </p>
      </div>

      <p className="mt-4 text-[0.55rem] text-gold-light/80" aria-hidden>
        ✦
      </p>
    </div>
  );
}
