import type { CSSProperties, ReactNode } from 'react';
import { ASSETS } from '@/lib/constants';

interface EnvelopeSurfaceProps {
  className?: string;
  style?: CSSProperties;
  clipPath?: string;
  children?: ReactNode;
}

/** พื้นผิวซอง — bg + img ซ้อนกันให้ texture แสดงเสมอ */
export function EnvelopeSurface({ className = '', style, clipPath, children }: EnvelopeSurfaceProps) {
  return (
    <div
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={{
        backgroundColor: '#234148',
        backgroundImage: `url(${ASSETS.envelopeTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
        clipPath,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.envelopeTexture}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 42%, rgba(0,0,0,0.22) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-12px_28px_rgba(0,0,0,0.2)]"
      />
      {children}
    </div>
  );
}

interface GoldStampProps {
  className?: string;
  size?: number;
}

/** ตราปั้มทอง (PNG โปร่งใส) */
export function GoldStamp({ className = '', size = 72 }: GoldStampProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute inset-[-8px] rounded-full blur-lg opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(200,169,110,0.6) 0%, transparent 70%)' }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.goldStamp}
        alt=""
        width={size}
        height={size}
        className="relative w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
        draggable={false}
      />
    </div>
  );
}
