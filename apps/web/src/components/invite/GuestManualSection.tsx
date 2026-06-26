import { WEDDING } from '@/lib/constants';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { Clock, Gift, Heart, Shirt, Smartphone, type LucideIcon } from 'lucide-react';

const ICONS: Record<(typeof WEDDING.guestManual)[number]['icon'], LucideIcon> = {
  clock: Clock,
  shirt: Shirt,
  smartphone: Smartphone,
  gift: Gift,
};

function CardDivider() {
  return (
    <div className="my-2.5 flex items-center gap-2 px-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light/80 to-transparent" />
      <span className="text-[0.45rem] text-gold">✦</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light/80 to-transparent" />
    </div>
  );
}

function ManualIcon({ name }: { name: (typeof WEDDING.guestManual)[number]['icon'] }) {
  const Icon = ICONS[name];

  return (
    <div className="mx-auto mb-3 h-[3.75rem] w-[3.75rem] rounded-full bg-gradient-to-br from-gold-light to-gold/80 p-[2px]">
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-cream">
        <Icon className="h-[1.35rem] w-[1.35rem] text-teal-dark" strokeWidth={1.6} aria-hidden />
        {name === 'smartphone' && (
          <Heart
            className="absolute bottom-2 right-2 h-2 w-2 fill-gold text-gold"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

export function GuestManualSection() {
  return (
    <section id="manual" className="relative overflow-hidden pb-12 pt-12 md:pb-14 md:pt-16">
      <FloralDecor preset="manual" />

      <div className="relative z-10 mx-auto max-w-[680px] px-6 text-center">
        <div className="reveal">
          <p className="mb-2 text-[0.8rem] tracking-[0.1em] text-sage">สำหรับแขก</p>
          <h2 className="font-display text-[2.5rem] text-teal-dark">Guest Guide</h2>
          <div className="mx-auto mt-3 flex max-w-[12rem] items-center gap-3 text-gold">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
            <span className="text-[0.55rem]">✦</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
          </div>
        </div>

        <div className="reveal mt-6 grid grid-cols-2 gap-3">
          {WEDDING.guestManual.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-sage-pale bg-white p-4 text-center shadow-[0_4px_16px_rgba(30,58,58,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,58,58,0.1)]"
            >
              <ManualIcon name={item.icon} />

              <h3 className="font-thai text-[0.82rem] font-medium leading-snug text-teal-dark">
                {item.title}
              </h3>

              <CardDivider />

              <p className="font-thai text-[0.72rem] leading-relaxed text-text-light">
                {item.desc}
              </p>

              {'showPalette' in item && item.showPalette && (
                <div className="mt-3 flex flex-nowrap items-center justify-center gap-1.5">
                  {WEDDING.palette.map((color) => (
                    <div
                      key={color.hex}
                      role="presentation"
                      aria-hidden
                      className="h-5 w-5 shrink-0 rounded-full border border-sage-pale/50 ring-2 ring-white"
                      style={{ background: color.hex }}
                    />
                  ))}
                </div>
              )}

              {'hashtag' in item && item.hashtag && (
                <p className="mt-2 font-thai text-[0.72rem] font-medium tracking-[0.02em] text-teal-dark">
                  {item.hashtag}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
