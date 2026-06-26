import { AdminHeader } from '@/components/admin/AdminHeader';
import { EventInfoEditor } from '@/components/admin/EventInfoEditor';
import { Clock } from 'lucide-react';

export default function AdminInfoPage() {
  return (
    <>
      <AdminHeader activeTab="info" />
      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-serif-cg text-[1.35rem] font-medium text-[#1a3228] sm:text-[1.5rem]">
                ข้อมูลงาน
              </h2>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#8a8a8a]">
                แก้ไขรายละเอียดงาน บัญชีรับเงิน และ QR Code — บันทึกลงฐานข้อมูลและแสดงบนการ์ดเชิญ
              </p>
            </div>
          </div>
        </header>
        <EventInfoEditor />
      </main>
    </>
  );
}
