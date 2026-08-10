'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LiffLinkClient } from '@/components/liff/LiffLinkClient';
import { HERO_GRADIENT } from '@/lib/constants';

function LoadingShell() {
  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-sage-pale/60 bg-[#FBF8F2]/95 p-8 text-center shadow-[0_12px_40px_rgba(30,58,58,0.08)]">
      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sage" aria-hidden />
      <p className="font-thai text-sm text-text-light">กำลังโหลด...</p>
    </div>
  );
}

export default function LiffLinkPage() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4 py-10"
      style={{ background: HERO_GRADIENT }}
    >
      <Suspense fallback={<LoadingShell />}>
        <LiffLinkClient />
      </Suspense>
    </main>
  );
}
