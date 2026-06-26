import { AdminHeader } from '@/components/admin/AdminHeader';
import { GuestTable } from '@/components/admin/GuestTable';
import { PrintAttendeeListButton } from '@/components/admin/PrintAttendeeListButton';
import { Users } from 'lucide-react';

export default function AdminGuestsPage() {
  return (
    <>
      <AdminHeader activeTab="guests" />
      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-serif-cg text-[1.35rem] font-medium text-[#1a3228] sm:text-[1.5rem]">
                  จัดการแขกและลิงก์เชิญ
                </h2>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#8a8a8a]">
                  สร้างชื่อบนการ์ดและลิงก์เฉพาะสำหรับแต่ละแขก แล้วส่งลิงก์ให้แขกผ่าน LINE หรือช่องทางอื่น
                </p>
              </div>
            </div>
            <PrintAttendeeListButton />
          </div>
        </header>
        <GuestTable />
      </main>
    </>
  );
}
