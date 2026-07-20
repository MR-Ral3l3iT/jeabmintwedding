'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  leadingIcon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'เลือก...',
  className,
  disabled = false,
  leadingIcon: LeadingIcon,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon ?? LeadingIcon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#e5e9e0] bg-[#faf8f4] px-3.5 py-3 text-sm text-[#2c2c2c] transition-colors hover:border-[#c5cfc5] disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {SelectedIcon && (
            <SelectedIcon className="h-4 w-4 shrink-0 text-[#6b7c5e]" aria-hidden="true" />
          )}
          <span className={cn('truncate', !selected && 'text-[#8a8a8a]')}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-[#8a8a8a] transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1.5 max-h-64 overflow-auto rounded-xl border border-[#e5e9e0] bg-white py-1 shadow-[0_8px_28px_rgba(30,58,58,0.12)]"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-[#eef2ea] font-medium text-[#1a3228]'
                      : 'text-[#2c2c2c] hover:bg-[#faf8f4]',
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn('h-4 w-4', isActive ? 'text-[#6b7c5e]' : 'text-[#8a8a8a]')}
                      aria-hidden="true"
                    />
                  )}
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
