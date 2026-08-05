'use client';

import { WEDDING } from '@/lib/constants';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { useInviteMessages } from '@/components/invite/InviteContext';

export function DressCodeSection() {
  const messages = useInviteMessages();

  return (
    <section id="dresscode" className="relative overflow-hidden pt-12 pb-12 md:pt-16 md:pb-16">
      <FloralDecor preset="dresscode" />

      <div className="relative z-10 px-6 max-w-[680px] mx-auto text-center">
        <div className="reveal">
          <p className="text-[0.8rem] tracking-[0.1em] text-sage mb-2">{messages.dress.eyebrow}</p>
          <h2 className="font-display text-[2.5rem] text-teal-dark mb-1">{messages.dress.title}</h2>
          <p className="font-serif-cg italic text-text-light">{messages.dress.subtitle}</p>
        </div>

        <div className="reveal my-6 flex flex-nowrap items-center justify-center gap-3 sm:gap-4">
          {WEDDING.palette.map((color) => (
            <div
              key={color.hex}
              role="presentation"
              aria-hidden
              className="h-12 w-12 shrink-0 rounded-full border border-sage-pale/50 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-[3px] ring-white transition-transform hover:scale-110"
              style={{ background: color.hex }}
            />
          ))}
        </div>

        <div className="reveal bg-white rounded-xl p-6 border border-sage-pale mt-4 font-thai text-text leading-[1.9]">
          <p className="text-sm text-text-light tracking-[0.04em]">{messages.dress.withPleasure}</p>
          <p className="mt-4 text-[0.95rem]">
            {messages.dress.body.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
