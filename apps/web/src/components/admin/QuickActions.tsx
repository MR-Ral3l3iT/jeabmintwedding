import Link from 'next/link';
import { ChevronRight, UserPlus, Users } from 'lucide-react';

const ACTIONS = [
  {
    href: '/admin/guests',
    label: 'จัดการรายชื่อแขก',
    desc: 'เพิ่มแขกและคัดลอกลิงก์เชิญ',
    icon: Users,
  },
  {
    href: '/admin/guests#add-guest',
    label: 'เพิ่มแขกใหม่',
    desc: 'สร้างลิงก์เชิญสำหรับแขกคนถัดไป',
    icon: UserPlus,
  },
] as const;

export function QuickActions() {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-[0.9rem] font-medium text-[#1a3228]">ทางลัด</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-4 rounded-[1.25rem] border border-[#e5e9e0] bg-white px-5 py-5 shadow-[0_2px_16px_rgba(30,58,58,0.04)] transition-all hover:border-[#c5cfc5] hover:shadow-[0_4px_22px_rgba(30,58,58,0.07)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ea] text-[#6b7c5e] transition-colors group-hover:bg-[#6b7c5e] group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.9rem] font-medium text-[#1a3228]">{label}</p>
              <p className="mt-0.5 text-[0.75rem] text-[#8a8a8a]">{desc}</p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-[#b8c4b0] transition-transform group-hover:translate-x-0.5 group-hover:text-[#6b7c5e]"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
