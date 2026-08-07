'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Download, QrCode } from 'lucide-react';
import { getJoinUrl } from '@/lib/constants';

const QR_SIZE = 220;
const DOWNLOAD_SIZE = 1024;

export function OfflineJoinQrPanel() {
  const joinUrl = getJoinUrl();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleDownloadPng() {
    const svg = svgWrapRef.current?.querySelector('svg');
    if (!svg || downloading) return;

    setDownloading(true);
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = DOWNLOAD_SIZE;
          canvas.height = DOWNLOAD_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('canvas'));
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, DOWNLOAD_SIZE, DOWNLOAD_SIZE);
          ctx.drawImage(img, 0, 0, DOWNLOAD_SIZE, DOWNLOAD_SIZE);
          URL.revokeObjectURL(url);

          const link = document.createElement('a');
          link.download = 'jeab-mint-join-qr.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('image'));
        };
        img.src = url;
      });
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="rounded-[1.25rem] border border-[#e5e9e0] bg-white p-5 shadow-[0_4px_24px_rgba(30,58,58,0.05)] sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
          <QrCode className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#1a3228]">QR ลงทะเบียนออฟไลน์ (/join)</h3>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-[#8a8a8a]">
            Static QR ไม่หมดอายุ — ให้แขกออฟไลน์สแกนเพื่อกรอกชื่อเรียกและฝั่ง แล้วค่อยเพิ่ม LINE OA
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div
          ref={svgWrapRef}
          className="rounded-2xl border border-[#e5e9e0] bg-white p-4 shadow-[0_2px_12px_rgba(30,58,58,0.04)]"
        >
          <QRCodeSVG value={joinUrl} size={QR_SIZE} level="M" includeMargin />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="mb-1.5 text-xs text-[#8a8a8a]">ลิงก์</p>
            <code className="block break-all rounded-xl bg-[#faf8f4] px-3.5 py-2.5 font-mono text-[0.75rem] text-[#1a3228]">
              {joinUrl}
            </code>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-4 py-2.5 text-sm text-[#1a3228] transition-colors hover:border-[#c5cfc5]"
            >
              {copied ? <Check className="h-4 w-4 text-[#6b7c5e]" /> : <Copy className="h-4 w-4" />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadPng()}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6b7c5e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a3228] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'กำลังสร้าง...' : 'ดาวน์โหลด PNG'}
            </button>
          </div>

          <p className="text-[0.72rem] leading-relaxed text-[#8a8a8a]">
            ไฟล์ PNG ความละเอียดสูง พิมพ์ติดการ์ดหรือป้ายงานได้เลย ไม่ต้องพึ่งเว็บเจน QR ภายนอก
          </p>
        </div>
      </div>
    </section>
  );
}
