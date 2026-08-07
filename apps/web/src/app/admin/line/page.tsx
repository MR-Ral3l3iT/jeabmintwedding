import { AdminHeader } from '@/components/admin/AdminHeader';
import { LineFriendsPanel } from '@/components/admin/LineFriendsPanel';
import { MessageCircle } from 'lucide-react';

export default function AdminLineFriendsPage() {
  return (
    <>
      <AdminHeader activeTab="line" />
      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-serif-cg text-[1.35rem] font-medium text-[#1a3228] sm:text-[1.5rem]">
                รายชื่อที่ผูก LINE
              </h2>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#8a8a8a]">
                ดูโปรไฟล์ LINE ที่ผูกกับแขกแล้ว และแก้ไขชื่อที่ตั้งหรือฝั่งได้
              </p>
            </div>
          </div>
        </header>
        <LineFriendsPanel />
      </main>
    </>
  );
}
