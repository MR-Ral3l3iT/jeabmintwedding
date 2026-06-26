import { ASSETS, USE_CUSTOM_BUTTERFLY_ART } from '@/lib/constants';
import { ButterflySprite } from '@/components/invite/ButterflySprite';
import { cn } from '@/lib/utils';

interface ButterflyFlight {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  path: string;
  variant: 'gold' | 'sage' | 'cream';
  flip?: boolean;
  /** ใช้รูปจาก ASSETS.butterflies — b01, b02, b03 */
  asset?: keyof typeof ASSETS.butterflies;
  opacity?: number;
}

const FLIGHTS: ButterflyFlight[] = [
  {
    top: '14%',
    left: '6%',
    size: 46,
    delay: '0s',
    duration: '15s',
    path: 'animate-butterfly-path-1',
    variant: 'gold',
    asset: 'b01',
    opacity: 0.82,
  },
  {
    top: '28%',
    left: '78%',
    size: 38,
    delay: '1.5s',
    duration: '18s',
    path: 'animate-butterfly-path-2',
    variant: 'sage',
    flip: true,
    asset: 'b02',
    opacity: 0.75,
  },
  {
    top: '48%',
    left: '12%',
    size: 34,
    delay: '3s',
    duration: '16s',
    path: 'animate-butterfly-path-3',
    variant: 'cream',
    asset: 'b03',
    opacity: 0.7,
  },
];

interface FlyingButterfliesProps {
  className?: string;
  /** ลอยทับทั้งหน้า ติด viewport ตอนเลื่อน (ใช้หลังเปิดซอง) */
  fixed?: boolean;
}

/** ผีเสื้อบินเบาๆ — ก่อนเปิดซองใน hero / หลังเปิดซองทั่วหน้า */
export function FlyingButterflies({ className, fixed = false }: FlyingButterfliesProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none inset-0 overflow-hidden',
        fixed ? 'fixed z-[18]' : 'absolute z-[5]',
        className,
      )}
    >
      {FLIGHTS.map((b, i) => {
        const customSrc =
          USE_CUSTOM_BUTTERFLY_ART && b.asset ? ASSETS.butterflies[b.asset] : undefined;

        return (
          <div
            key={i}
            className={['absolute motion-reduce:animate-none', b.path].join(' ')}
            style={{
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size * 0.72,
              opacity: b.opacity,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          >
            <div className={b.flip ? 'h-full w-full scale-x-[-1]' : 'h-full w-full'}>
              <ButterflySprite
                variant={b.variant}
                src={customSrc}
                className="drop-shadow-[0_2px_6px_rgba(30,58,58,0.12)]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
