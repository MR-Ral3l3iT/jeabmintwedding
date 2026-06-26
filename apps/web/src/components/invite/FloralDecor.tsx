import { ASSETS } from '@/lib/constants';

type FloralPreset =
  | 'hero'
  | 'hero-closed'
  | 'hero-open'
  | 'quote'
  | 'countdown'
  | 'venue'
  | 'dresscode'
  | 'manual'
  | 'rsvp'
  | 'footer';

interface FloralItem {
  src: string;
  className: string;
  loading?: 'eager' | 'lazy';
}

/** มุมจอ — ไม่ clip ให้ดอกไม้โผล่จากขอบธรรมชาติ */
const HERO_PRESETS = new Set<FloralPreset>(['hero', 'hero-closed', 'hero-open']);

/** ลดขอบตัดคมของ PNG */
const SOFT_EDGE =
  '[mask-image:radial-gradient(ellipse_88%_88%_at_50%_50%,#000_48%,transparent_92%)]';

type StandardFloralPreset = Exclude<FloralPreset, 'hero-closed'>;

const PRESETS: Record<StandardFloralPreset, FloralItem[]> = {
  hero: [
    {
      src: ASSETS.flowers.f01,
      className:
        'top-[-4%] -left-[14%] w-[min(58vw,320px)] max-w-none opacity-[0.84]',
      loading: 'eager',
    },
    {
      src: ASSETS.flowers.f01,
      className:
        'top-[-4%] -right-[14%] w-[min(58vw,320px)] max-w-none opacity-[0.84] scale-x-[-1]',
      loading: 'eager',
    },
  ],
  'hero-open': [
    {
      src: ASSETS.flowers.f05,
      className:
        'bottom-[-8%] left-[-26%] w-[min(50vw,290px)] max-w-none opacity-80',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f05,
      className:
        'bottom-[-8%] right-[-26%] w-[min(50vw,290px)] max-w-none opacity-80 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
  quote: [
    {
      src: ASSETS.flowers.f03,
      className: 'top-[-18%] left-[-12%] w-[min(48vw,280px)] max-w-none opacity-70',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f03,
      className: 'top-[-18%] right-[-12%] w-[min(48vw,280px)] max-w-none opacity-70 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
  countdown: [
    {
      src: ASSETS.flowers.f02,
      className: 'top-[2%] left-[-28%] w-[min(36vw,200px)] max-w-none opacity-80',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f06,
      className: 'top-[8%] right-[-18%] w-[min(32vw,180px)] max-w-none opacity-80',
      loading: 'lazy',
    },
  ],
  venue: [
    {
      src: ASSETS.flowers.f05,
      className: 'top-[12%] left-[-22%] w-[min(44vw,260px)] max-w-none opacity-75',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f04,
      className: 'bottom-[8%] right-[-20%] w-[min(40vw,240px)] max-w-none opacity-75 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
  dresscode: [
    {
      src: ASSETS.flowers.f03,
      className: 'top-[6%] right-[-16%] w-[min(36vw,200px)] max-w-none opacity-65',
      loading: 'lazy',
    },
  ],
  manual: [
    {
      src: ASSETS.flowers.f03,
      className: 'top-[-2%] left-[-16%] w-[min(44vw,250px)] max-w-none opacity-80',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f04,
      className: 'bottom-[-6%] left-[-18%] w-[min(46vw,270px)] max-w-none opacity-80',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f02,
      className: 'bottom-[-4%] right-[-24%] w-[min(34vw,190px)] max-w-none opacity-75 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
  rsvp: [
    {
      src: ASSETS.flowers.f05,
      className: 'top-[36%] left-[-18%] w-[min(42vw,220px)] max-w-none opacity-70',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f05,
      className: 'top-[36%] right-[-18%] w-[min(42vw,220px)] max-w-none opacity-70 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
  footer: [
    {
      src: ASSETS.flowers.f06,
      className: 'bottom-[-18%] left-[-10%] w-[min(22vw,120px)] max-w-none opacity-55',
      loading: 'lazy',
    },
    {
      src: ASSETS.flowers.f05,
      className: 'bottom-[-18%] right-[-10%] w-[min(24vw,130px)] max-w-none opacity-50 scale-x-[-1]',
      loading: 'lazy',
    },
  ],
};

/** พุ่มดอกไม้ติดขอบล่างจอ — หน้าก่อนเปิดซอง */
function HeroClosedBottomFloral({ className = '' }: { className?: string }) {
  const fadeTop = '[mask-image:linear-gradient(to_top,#000_62%,transparent_100%)]';

  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none absolute inset-x-0 bottom-0 z-[2]',
        'h-[clamp(200px,32vh,320px)]',
        className,
      ].join(' ')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.flowers.f01}
        alt=""
        loading="eager"
        draggable={false}
        className={[
          'absolute bottom-0 left-0 h-full w-auto max-w-[58%]',
          'select-none object-contain object-left-bottom opacity-[0.9]',
          fadeTop,
        ].join(' ')}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.flowers.f01}
        alt=""
        loading="eager"
        draggable={false}
        className={[
          'absolute bottom-0 right-0 h-full w-auto max-w-[58%]',
          'select-none object-contain object-right-bottom opacity-[0.9] scale-x-[-1]',
          fadeTop,
        ].join(' ')}
      />
    </div>
  );
}

interface FloralDecorProps {
  preset: FloralPreset;
  className?: string;
}

/** ดอกไม้ตกแต่งตาม preset — วาง absolute ใน section ที่ relative */
export function FloralDecor({ preset, className = '' }: FloralDecorProps) {
  if (preset === 'hero-closed') {
    return <HeroClosedBottomFloral className={className} />;
  }

  const items = PRESETS[preset];
  const isHero = HERO_PRESETS.has(preset);

  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none absolute inset-0',
        isHero ? 'overflow-visible' : 'overflow-hidden',
        className,
      ].join(' ')}
    >
      {items.map((item, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${preset}-${index}`}
          src={item.src}
          alt=""
          loading={item.loading ?? 'lazy'}
          draggable={false}
          className={[
            'absolute select-none',
            isHero ? SOFT_EDGE : '',
            item.className,
          ].join(' ')}
        />
      ))}
    </div>
  );
}
