import { AdminHeader } from '@/components/admin/AdminHeader';
import { SeatingPlanPanel } from '@/components/admin/SeatingPlanPanel';
import { LayoutGrid } from 'lucide-react';

export default function AdminSeatingPage() {
  return (
    <>
      <AdminHeader activeTab="seating" />
      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e]">
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-serif-cg text-[1.35rem] font-medium text-[#1a3228] sm:text-[1.5rem]">
                ผังโต๊ะอาหาร
              </h2>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[#8a8a8a]">
                คลิกโต๊ะบนผังเพื่อติดป้ายกลุ่ม (จากประเภทการ์ดหรือกลุ่มกำหนดเอง) และระบุแขกเป็นรายชื่อเมื่อต้องแยกโต๊ะ
              </p>
            </div>
          </div>
        </header>
        <SeatingPlanPanel />
      </main>
    </>
  );
}
