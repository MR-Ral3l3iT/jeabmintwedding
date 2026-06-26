'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInvite } from '@/components/invite/InviteContext';
import { FlyingButterflies } from '@/components/invite/FlyingButterflies';

/** ผีเสื้อบินทั่วหน้าเชิญ หลังเปิดซองแล้ว — portal ไป body เพื่อไม่ถูก section บัง */
export function InvitePageButterflies() {
  const { envelopeOpened } = useInvite();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!envelopeOpened || !mounted) return null;

  return createPortal(<FlyingButterflies fixed />, document.body);
}
