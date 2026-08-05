'use client';

import { FloralDecor } from '@/components/invite/FloralDecor';
import { useInviteMessages } from '@/components/invite/InviteContext';

export function QuoteSection() {
  const messages = useInviteMessages();

  return (
    <section
      id="quote"
      className="relative w-full px-8 text-center overflow-hidden bg-teal-dark pt-24 pb-12 md:py-16"
    >
      <FloralDecor preset="quote" />

      <blockquote className="reveal relative z-10 max-w-lg mx-auto">
        <p className="font-serif-cg-bold text-[clamp(1.15rem,3.2vw,1.5rem)] italic text-gold-light leading-[1.8] mb-4">
          &ldquo;{messages.quote.line1}
          <br />
          {messages.quote.line2}&rdquo;
        </p>
        <cite className="reveal text-xs tracking-[0.08em] text-sage-pale not-italic font-serif-cg">
          {messages.quote.cite}
        </cite>
      </blockquote>
    </section>
  );
}
