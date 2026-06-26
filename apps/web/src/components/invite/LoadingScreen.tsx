'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ASSETS } from '@/lib/constants';
import { EnvelopeSurface } from '@/components/invite/EnvelopeParts';

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const overlay = (
    <div
      className={[
        'fixed inset-0 z-[9999] isolate flex flex-col items-center justify-center gap-4 px-6',
        'h-[100dvh]',
        'transition-opacity duration-[800ms]',
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
      aria-hidden={hidden}
    >
      {/* พื้นผิวซองเต็มจอ — อยู่หลังเนื้อหา */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <EnvelopeSurface className="h-full w-full" />
      </div>

      {/* โลโก้ + ชื่อ */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.logo}
          alt=""
          className="relative z-10 w-[7.5rem] max-w-[42vw] h-auto animate-pulse drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
          draggable={false}
        />

        <div className="relative z-10 w-40 h-px bg-gold/40 overflow-hidden">
          <div className="absolute inset-0 bg-gold animate-[loadSlide_1.8s_ease_forwards]" />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.coupleName}
          alt="Jeab & Mint"
          className="relative z-10 w-[8rem] max-w-[52vw] h-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
          draggable={false}
        />
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(overlay, document.body);
}
