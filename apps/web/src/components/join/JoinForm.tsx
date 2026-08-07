'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ChevronRight,
  Heart,
  Leaf,
  Loader2,
  MessageCircle,
  Users,
} from 'lucide-react';
import { getJoinGuest, submitJoin } from '@/lib/api';
import { LineLinkHint } from '@/components/invite/LineLinkHint';
import { InviteProvider } from '@/components/invite/InviteContext';
import { useWeddingConfig } from '@/components/WeddingSettingsProvider';
import { HERO_GRADIENT } from '@/lib/constants';
import {
  fillTemplate,
  getInviteMessages,
  normalizeInviteLocale,
  type InviteLocale,
} from '@/lib/i18n';
import type { JoinResponse, PartySide } from '@/types';

interface JoinFormProps {
  token?: string;
}

export function JoinForm({ token }: JoinFormProps) {
  const config = useWeddingConfig();
  const [locale, setLocale] = useState<InviteLocale>('TH');
  const messages = getInviteMessages(locale);
  const [name, setName] = useState('');
  const [partySide, setPartySide] = useState<PartySide | ''>('');
  const [loadingPrefill, setLoadingPrefill] = useState(Boolean(token));
  const [prefillError, setPrefillError] = useState('');
  const [displayHint, setDisplayHint] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<JoinResponse | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      setLoadingPrefill(true);
      setPrefillError('');
      try {
        const guest = await getJoinGuest(token);
        if (cancelled) return;
        if (guest.name) setName(guest.name);
        if (guest.partySide) setPartySide(guest.partySide);
        setDisplayHint(guest.displayName);
        setLocale(normalizeInviteLocale(guest.locale));
      } catch (err) {
        if (!cancelled) {
          setPrefillError(err instanceof Error ? err.message : 'ไม่พบลิงก์ลงทะเบียนนี้');
        }
      } finally {
        if (!cancelled) setLoadingPrefill(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(messages.join.nicknameRequired);
      return;
    }
    if (!partySide) {
      setError(messages.join.sideRequired);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await submitJoin({
        name: trimmed,
        partySide,
        ...(token && { token }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  }

  const content = (() => {
    if (loadingPrefill) {
      return (
        <Shell>
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-6 w-6 animate-spin text-sage" aria-hidden />
            <p className="font-thai text-sm text-text-light">{messages.join.loading}</p>
          </div>
        </Shell>
      );
    }

    if (prefillError) {
      return (
        <Shell>
          <div className="py-8 text-center">
            <h1 className="font-display text-2xl text-teal-dark">{messages.join.notFoundTitle}</h1>
            <p className="mt-3 font-thai text-sm text-text-light">{prefillError}</p>
          </div>
        </Shell>
      );
    }

    if (result) {
      const lineUrl = result.lineOaUrl || config.lineOaUrl;
      return (
        <Shell>
          <div className="text-center">
            <Users className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden />
            <h1 className="font-display text-[1.65rem] leading-tight text-teal-dark">
              {messages.join.savedTitle}
            </h1>
            <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
              ✦
            </p>
            <p className="font-thai text-xs text-text-light">{messages.join.welcome}</p>
            <p className="mt-1 font-display text-[1.5rem] leading-tight text-teal-dark">
              {result.name}
            </p>
            <p className="mt-1.5 inline-flex items-center justify-center gap-1.5 font-thai text-sm text-teal-dark">
              {result.partySide === 'GROOM' ? messages.join.sideGroom : messages.join.sideBride}
              <Heart className="h-3.5 w-3.5 text-sage" strokeWidth={1.8} aria-hidden />
            </p>

            <p className="mt-5 font-thai text-[0.75rem] leading-relaxed text-text-light">
              {messages.join.nextLine}
            </p>

            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-3 rounded-2xl bg-sage p-3.5 text-left shadow-[0_6px_20px_rgba(107,124,94,0.28)] transition-colors hover:bg-teal-dark sm:p-4"
            >
              <MessageCircle
                className="h-6 w-6 shrink-0 text-gold-light"
                strokeWidth={1.6}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-thai text-sm font-semibold text-white">{messages.join.addLine}</p>
                <p className="mt-0.5 font-thai text-[0.68rem] leading-relaxed text-white/80">
                  {messages.join.addLineDesc}
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <ChevronRight className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
              </span>
            </a>

            <LineLinkHint inviteToken={result.inviteToken} variant="light" />

            <div className="mt-5 flex flex-col items-center gap-2">
              <p className="font-thai text-[0.7rem] text-text-light">{messages.join.orScanLine}</p>
              <div className="rounded-2xl border border-sage-pale/60 bg-white p-3 shadow-sm">
                <QRCodeSVG value={lineUrl} size={140} level="M" includeMargin={false} />
              </div>
            </div>

            <p className="mt-4 inline-flex items-center gap-1 text-[0.5rem] text-gold-light/70" aria-hidden>
              <Leaf className="h-2.5 w-2.5" strokeWidth={1.5} />
              ✦
              <Leaf className="h-2.5 w-2.5 scale-x-[-1]" strokeWidth={1.5} />
            </p>
          </div>
        </Shell>
      );
    }

    return (
      <Shell>
        <div className="text-center">
          <Users className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden />
          <h1 className="font-display text-[1.65rem] leading-tight text-teal-dark">
            {messages.join.formTitle}
          </h1>
          <p className="my-2 text-[0.45rem] text-gold-light/80" aria-hidden>
            ✦
          </p>
          <p className="font-thai text-sm leading-relaxed text-text-light">
            {messages.join.formIntro.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          {displayHint && (
            <p className="mt-2 font-thai text-[0.7rem] text-sage">
              {messages.join.forGuest}: {displayHint}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="join-name" className="mb-1.5 block font-thai text-sm font-medium text-teal-dark">
              {messages.join.nicknameLabel}
            </label>
            <input
              id="join-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              maxLength={100}
              placeholder={messages.join.nicknamePlaceholder}
              className="w-full rounded-xl border border-sage-pale bg-white px-3.5 py-2.5 font-thai text-sm text-teal-dark outline-none focus:border-sage"
              disabled={submitting}
              autoComplete="nickname"
            />
          </div>

          <fieldset>
            <legend className="mb-2 font-thai text-sm font-medium text-teal-dark">
              {messages.join.sideLegend}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: 'GROOM' as const,
                    label: fillTemplate(messages.join.sideGroomBtn, { name: config.groomNickname }),
                  },
                  {
                    value: 'BRIDE' as const,
                    label: fillTemplate(messages.join.sideBrideBtn, { name: config.brideNickname }),
                  },
                ] as const
              ).map((opt) => {
                const selected = partySide === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPartySide(opt.value);
                      setError('');
                    }}
                    disabled={submitting}
                    className={
                      selected
                        ? 'rounded-xl border-2 border-sage bg-sage/10 px-3 py-3 font-thai text-sm font-semibold text-teal-dark'
                        : 'rounded-xl border border-sage-pale bg-white px-3 py-3 font-thai text-sm text-text-light hover:border-sage'
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sage px-4 py-3 font-thai text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {messages.join.saving}
              </>
            ) : (
              messages.join.submit
            )}
          </button>
        </form>
      </Shell>
    );
  })();

  return <InviteProvider locale={locale}>{content}</InviteProvider>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4 py-10"
      style={{ background: HERO_GRADIENT }}
    >
      <div className="w-full max-w-md rounded-[1.75rem] border border-sage-pale/60 bg-[#FBF8F2]/95 p-6 shadow-[0_12px_40px_rgba(30,58,58,0.08)] sm:p-8">
        {children}
      </div>
    </main>
  );
}
