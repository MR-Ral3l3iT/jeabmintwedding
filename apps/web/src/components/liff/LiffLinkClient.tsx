'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { linkLineViaLiff } from '@/lib/api';
import {
  clearStoredLiffInviteToken,
  resolveLiffInviteToken,
} from '@/lib/liff-token';

type Status = 'loading' | 'success' | 'error';

export function LiffLinkClient({ token: tokenProp }: { token?: string }) {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('กำลังเชื่อมบัญชี LINE...');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Read (and stash) before init so an OAuth round trip cannot lose it
      const tokenBeforeInit = resolveLiffInviteToken(tokenProp);
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();

      if (!liffId) {
        setStatus('error');
        setMessage('ยังไม่ได้ตั้งค่า LIFF บนเว็บไซต์');
        return;
      }

      try {
        // withLoginOnExternalBrowser lets Chrome/Safari (camera scans) log in too
        await liff.init({ liffId, withLoginOnExternalBrowser: true });

        // LIFF rewrites the URL from liff.state after init — re-read the token
        const inviteToken = resolveLiffInviteToken(tokenProp) ?? tokenBeforeInit;

        if (!inviteToken) {
          setStatus('error');
          setMessage(
            'ไม่พบรหัสแขกในลิงก์ กรุณากลับไปหน้าลงทะเบียน แล้วกดปุ่ม “เปิดใน LINE เพื่อผูกบัญชี” อีกครั้ง',
          );
          return;
        }

        if (!liff.isLoggedIn()) {
          liff.login({
            redirectUri: `${window.location.origin}/liff/link/${encodeURIComponent(inviteToken)}`,
          });
          return;
        }

        const idToken = liff.getIDToken();
        if (!idToken) {
          setStatus('error');
          setMessage(
            'ไม่สามารถยืนยันตัวตน LINE ได้ กรุณาลองใหม่อีกครั้ง',
          );
          setDetail('LIFF ไม่ได้คืน ID token — ตรวจสอบว่าเปิด scope openid ใน LIFF app แล้ว');
          return;
        }

        const result = await linkLineViaLiff({ inviteToken, idToken });
        if (cancelled) return;
        clearStoredLiffInviteToken();
        setStatus('success');
        setMessage(result.message || 'เชื่อมบัญชีเรียบร้อยแล้ว');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'เชื่อมบัญชีไม่สำเร็จ');
        setDetail(
          typeof window !== 'undefined'
            ? `inClient=${safeInClient()} url=${window.location.pathname}${window.location.search}`
            : '',
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [tokenProp]);

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
      {status === 'error' && detail && (
        <p className="mt-3 break-all font-mono text-[0.6rem] text-text-light/70">{detail}</p>
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

function safeInClient(): boolean | 'unknown' {
  try {
    return liff.isInClient();
  } catch {
    return 'unknown';
  }
}
