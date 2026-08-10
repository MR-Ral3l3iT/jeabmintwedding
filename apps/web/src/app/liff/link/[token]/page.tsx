'use client';

import { useParams } from 'next/navigation';
import { LiffLinkClient } from '@/components/liff/LiffLinkClient';
import { HERO_GRADIENT } from '@/lib/constants';

export default function LiffLinkTokenPage() {
  const params = useParams();
  const token = typeof params.token === 'string' ? params.token : params.token?.[0];

  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4 py-10"
      style={{ background: HERO_GRADIENT }}
    >
      <LiffLinkClient token={token} />
    </main>
  );
}
