import Image from 'next/image';
import { ASSETS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AdminFloralDecorProps {
  variant?: 'banner-left' | 'banner-right' | 'card' | 'empty' | 'header';
  className?: string;
}

const VARIANTS = {
  'banner-left': {
    src: ASSETS.flowers.f01,
    className:
      'pointer-events-none absolute top-[-6%] left-[-5%] z-0 h-[88%] w-[min(36%,175px)] max-w-[175px] opacity-[0.58]',
    flip: false,
    objectPosition: 'object-left-top',
  },
  'banner-right': {
    src: ASSETS.flowers.f01,
    className:
      'pointer-events-none absolute top-[-6%] right-[-5%] z-0 h-[88%] w-[min(36%,175px)] max-w-[175px] opacity-[0.58]',
    flip: true,
    objectPosition: 'object-right-top',
  },
  card: {
    src: ASSETS.flowers.f03,
    className:
      'pointer-events-none absolute bottom-0 left-0 z-0 h-[75%] w-14 opacity-[0.16]',
    flip: false,
    objectPosition: 'object-left-bottom',
  },
  empty: {
    src: ASSETS.flowers.f04,
    className: 'relative mx-auto h-12 w-12 opacity-40',
    flip: false,
    objectPosition: 'object-center',
  },
  header: {
    src: ASSETS.flowers.f06,
    className: 'relative h-9 w-9 shrink-0 opacity-70',
    flip: false,
    objectPosition: 'object-center',
  },
} as const;

export function AdminFloralDecor({ variant = 'card', className }: AdminFloralDecorProps) {
  const config = VARIANTS[variant];

  return (
    <div aria-hidden className={cn('select-none', config.className, className)}>
      <Image
        src={config.src}
        alt=""
        fill
        className={cn('object-contain', config.objectPosition, config.flip && 'scale-x-[-1]')}
        sizes={variant === 'header' || variant === 'empty' ? '48px' : '200px'}
      />
    </div>
  );
}
