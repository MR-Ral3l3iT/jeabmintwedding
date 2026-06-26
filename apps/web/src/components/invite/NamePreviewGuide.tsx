'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useState } from 'react';

interface NamePreviewGuideProps {
  guestName: string;
}

const LOCATIONS = [
  {
    num: '①',
    title: 'หัวการ์ดเชิญ',
    desc: 'แสดงชื่อแขกแทน "ยินดีต้อนรับ"',
  },
  {
    num: '②',
    title: 'การ์ดในซอง',
    desc: 'เส้นทอง + ชื่อแขก + ข้อความพิธีมงคลสมรสบนการ์ดในซอง',
  },
  {
    num: '③',
    title: 'ฟอร์ม RSVP',
    desc: 'ชื่อถูกกรอกให้อัตโนมัติ (แก้ไม่ได้)',
  },
  {
    num: '④',
    title: 'หลังยืนยัน',
    desc: '"ดีใจมากที่ [ชื่อ] จะมาร่วมงานนะคะ"',
  },
] as const;

export function NamePreviewGuide({ guestName }: NamePreviewGuideProps) {
  const [open, setOpen] = useState(true);

  function openRsvpDemo() {
    window.dispatchEvent(new CustomEvent('open-rsvp-modal'));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[200] px-4 py-2 rounded-full bg-teal-dark text-white text-xs shadow-lg hover:bg-sage transition-colors"
      >
        ดูจุดแสดงชื่อ
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-sage-pale shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.1em] uppercase text-sage mb-1">ตัวอย่าง preview</p>
            <h3 className="font-serif-cg text-lg text-teal-dark leading-tight">ชื่อบนการ์ดจะแสดงตรงไหน?</h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-text-light hover:text-text shrink-0"
            aria-label="ปิดคำอธิบาย"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-light mb-4">
          ชื่อที่ใส่ในหลังบ้าน:{' '}
          <span className="font-medium text-teal-dark">&ldquo;{guestName}&rdquo;</span>
        </p>

        <ul className="space-y-2.5 mb-4">
          {LOCATIONS.map((item) => (
            <li key={item.num} className="flex gap-2.5 text-sm">
              <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center shrink-0 font-medium">
                {item.num}
              </span>
              <span>
                <span className="font-medium text-text">{item.title}</span>
                <span className="text-text-light"> — {item.desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openRsvpDemo}
            className="px-4 py-2 rounded-lg bg-sage text-white text-xs hover:bg-teal-dark transition-colors"
          >
            ดูตัวอย่าง ③ RSVP
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-sage-pale text-text-light text-xs hover:bg-sage-pale/50 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
