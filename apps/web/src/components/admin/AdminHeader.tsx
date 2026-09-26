'use client';

import { useRouter } from 'next/navigation';
import { Clock, Home, LayoutGrid, LogOut, Mail, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type AdminTab = 'dashboard' | 'guests' | 'seating' | 'wishes' | 'line' | 'info';

interface AdminHeaderProps {
  activeTab?: AdminTab;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', key: 'dashboard' as const, icon: Home },
  { href: '/admin/guests', label: 'รายชื่อแขก', key: 'guests' as const, icon: Users },
  { href: '/admin/seating', label: 'ผังโต๊ะ', key: 'seating' as const, icon: LayoutGrid },
  { href: '/admin/wishes', label: 'คำอวยพร', key: 'wishes' as const, icon: Mail },
  { href: '/admin/line', label: 'ผูก LINE', key: 'line' as const, icon: MessageCircle },
  { href: '/admin/info', label: 'ข้อมูลงาน', key: 'info' as const, icon: Clock },
] as const;

const GOLD = '#d4b87a';

export function AdminHeader({ activeTab }: AdminHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    document.cookie = 'admin-token=; path=/; max-age=0';
    router.push('/admin/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1a3228] text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3.5 sm:gap-6 sm:px-8">
        <div>
          <h1 className="whitespace-nowrap font-display text-[1.55rem] leading-none sm:text-[1.85rem]" style={{ color: GOLD }}>
            Jeab &amp; Mint
          </h1>
          <p className="mt-1 text-center text-[0.55rem] font-medium tracking-[0.18em] text-white/55 uppercase sm:text-[0.6rem]">
            Admin Dashboard
          </p>
        </div>

        <nav className="flex items-center justify-center gap-0 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-[0.75rem] transition-colors sm:px-4 sm:text-[0.82rem]',
                  isActive ? 'border-[#d4b87a]' : 'border-transparent hover:opacity-80',
                )}
                style={{ color: GOLD }}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 text-[0.75rem] transition-opacity hover:opacity-80 sm:text-[0.82rem]"
          style={{ color: GOLD }}
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}
