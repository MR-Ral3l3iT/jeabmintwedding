'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { linkLineViaLiff } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

const TOKEN_STORAGE_KEY = 'liff_invite_token';

function persistToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

function readStoredToken(): string | null {
  try {
    return (
      sessionStorage.getItem(TOKEN_STORAGE_KEY)?.trim() ||
      localStorage.getItem(TOKEN_STORAGE_KEY)?.trim() ||
      null
    );
  } catch {
    return null;
  }
}

function clearStoredToken() {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function resolveInviteToken(explicitToken?: string | null): string | null {
  const fromProp = explicitToken?.trim();
  if (fromProp) {
    persistToken(fromProp);
    return fromProp;
  }

  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('token')?.trim();
    if (fromQuery) {
      persistToken(fromQuery);
      return fromQuery;
    }

    // /liff/link/<token>
    const parts = window.location.pathname.split('/').filter(Boolean);
    const linkIdx = parts.indexOf('link');
    if (linkIdx >= 0 && parts[linkIdx + 1]) {
      const fromPath = parts[linkIdx + 1].trim();
      if (fromPath && fromPath !== 'link') {
        persistToken(fromPath);
        return fromPath;
      }
    }
  }

  return readStoredToken();
}

export function LiffLinkClient({ token: tokenProp }: { token?: string }) {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('กำลังเชื่อมบัญชี LINE...');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const inviteToken = resolveInviteToken(tokenProp);
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();

      if (!inviteToken) {
        setStatus('error');
        setMessage(
          'ไม่พบรหัสแขกในลิงก์ กรุณากลับไปหน้าลงทะเบียน แล้วกดปุ่ม “เปิดใน LINE เพื่อผูกบัญชี” อีกครั้ง',
        );
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
          // Path-based redirect keeps token after LINE Login in external browsers
          const redirectUri = `${window.location.origin}/liff/link/${encodeURIComponent(inviteToken)}`;
          liff.login({ redirectUri });
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
        clearStoredToken();
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
