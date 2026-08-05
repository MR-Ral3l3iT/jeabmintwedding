'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface LineLinkHintProps {
  inviteToken?: string;
  variant?: 'light' | 'dark';
}

export function LineLinkHint({ inviteToken, variant = 'light' }: LineLinkHintProps) {
  const [copied, setCopied] = useState(false);
  if (!inviteToken) return null;

  const command = `ผูก ${inviteToken}`;
  const isDark = variant === 'dark';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
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
          ? 'mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left'
          : 'mt-3 rounded-xl border border-sage-pale/50 bg-white/70 p-3 text-left'
      }
    >
      <p
        className={
          isDark
            ? 'font-thai text-[0.68rem] leading-relaxed text-white/70'
            : 'font-thai text-[0.68rem] leading-relaxed text-text-light'
        }
      >
        หลังเพิ่มเพื่อนแล้ว พิมพ์ในแชท LINE เพื่อเชื่อมบัญชี:
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code
          className={
            isDark
              ? 'min-w-0 flex-1 break-all rounded-lg bg-black/20 px-2.5 py-1.5 font-mono text-[0.7rem] text-gold-light'
              : 'min-w-0 flex-1 break-all rounded-lg bg-sage-pale/40 px-2.5 py-1.5 font-mono text-[0.7rem] text-teal-dark'
          }
        >
          {command}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={
            isDark
              ? 'inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[0.65rem] text-white/80 hover:bg-white/20'
              : 'inline-flex shrink-0 items-center gap-1 rounded-lg bg-sage-pale px-2.5 py-1.5 text-[0.65rem] text-sage hover:bg-sage hover:text-white'
          }
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
    </div>
  );
}
