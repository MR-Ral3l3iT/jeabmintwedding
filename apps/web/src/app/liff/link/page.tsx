'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { linkLineViaLiff } from '@/lib/api';
import { HERO_GRADIENT } from '@/lib/constants';

type Status = 'loading' | 'success' | 'error';

function LiffLinkContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('กำลังเชื่อมบัญชี LINE...');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const inviteToken = searchParams.get('token')?.trim();
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();

      if (!inviteToken) {
        setStatus('error');
        setMessage('ไม่พบรหัสแขกในลิงก์ กรุณากลับไปหน้าลงทะเบียนแล้วลองใหม่');
        return;
      }
      if (!liffId) {
        setStatus('error');
        setMessage('ยังไม่ได้ตั้งค่า LIFF บนเว็บไซต์');
        return;
      }

      try {
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const idToken = liff.getIDToken();
        if (!idToken) {
          setStatus('error');
          setMessage('ไม่สามารถยืนยันตัวตน LINE ได้ กรุณาลองใหม่');
          return;
        }

        const result = await linkLineViaLiff({ inviteToken, idToken });
        if (cancelled) return;
        setStatus('success');
        setMessage(result.message || 'เชื่อมบัญชีเรียบร้อยแล้ว');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'เชื่อมบัญชีไม่สำเร็จ');
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-sage-pale/60 bg-[#FBF8F2]/95 p-8 text-center shadow-[0_12px_40px_rgba(30,58,58,0.08)]">
      {status === 'loading' && (
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sage" aria-hidden />
      )}
      {status === 'success' && (
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-sage" aria-hidden />
      )}
      {status === 'error' && (
        <XCircle className="mx-auto mb-3 h-8 w-8 text-red-400" aria-hidden />
      )}
      <h1 className="font-display text-2xl text-teal-dark">
        {status === 'loading' && 'กำลังผูกบัญชี'}
        {status === 'success' && 'ผูกบัญชีสำเร็จ'}
        {status === 'error' && 'ผูกบัญชีไม่สำเร็จ'}
      </h1>
      <p className="mt-3 whitespace-pre-wrap font-thai text-sm leading-relaxed text-text-light">
        {message}
      </p>
      {status === 'success' && (
        <p className="mt-4 font-thai text-[0.75rem] text-sage">
          ปิดหน้าต่างนี้แล้วกลับไปแชท LINE OA ได้เลยค่ะ
        </p>
      )}
      {status !== 'loading' && (
        <button
          type="button"
          onClick={() => {
            try {
              if (liff.isInClient()) {
                liff.closeWindow();
                return;
              }
            } catch {
              // ignore
            }
            window.close();
          }}
          className="mt-6 rounded-full bg-sage px-5 py-2.5 font-thai text-sm text-white hover:bg-teal-dark"
        >
          ปิดหน้านี้
        </button>
      )}
    </div>
  );
}

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
        <LiffLinkContent />
      </Suspense>
    </main>
  );
}
