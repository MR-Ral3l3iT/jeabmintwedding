'use client';

import { WEDDING } from '@/lib/constants';
import { useCountdown } from '@/hooks/useCountdown';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { useInviteMessages } from '@/components/invite/InviteContext';

export function CountdownSection() {
  const countdown = useCountdown(WEDDING.date);
  const messages = useInviteMessages();

  const units = [
    { key: 'days' as const, label: messages.countdown.days },
    { key: 'hours' as const, label: messages.countdown.hours },
    { key: 'minutes' as const, label: messages.countdown.minutes },
    { key: 'seconds' as const, label: messages.countdown.seconds },
  ];

  return (
    <section id="countdown" className="relative overflow-hidden pt-20 pb-6 md:pb-14">
      <FloralDecor preset="countdown" />

      <div className="relative z-10 px-6 max-w-[680px] mx-auto text-center">
        <div className="reveal">
          <p className="text-[0.8rem] tracking-[0.1em] text-sage mb-2">{messages.countdown.eyebrow}</p>
          <h2 className="font-display text-[2.5rem] text-teal-dark mb-2">{messages.countdown.title}</h2>
          <p className="font-thai text-base font-medium tracking-[0.12em] text-sage">
            {messages.countdown.date}
          </p>
        </div>

        <div className="reveal grid grid-cols-4 gap-3 max-w-[400px] mx-auto my-8">
          {units.map(({ key, label }) => (
            <div
              key={key}
              className="bg-white rounded-xl py-5 px-2 shadow-[0_4px_20px_rgba(30,58,58,0.08)] border border-sage-pale relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sage to-gold" />
              <span className="font-serif-cg text-[2.2rem] font-normal text-teal-dark leading-none block">
                {String(countdown[key]).padStart(2, '0')}
              </span>
              <span className="text-[0.6rem] tracking-[0.08em] text-sage mt-1 block">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="reveal flex items-center gap-4 text-gold">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
          <span>✦</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
        </div>
      </div>
    </section>
  );
}
