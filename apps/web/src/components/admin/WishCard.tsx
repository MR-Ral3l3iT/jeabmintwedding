import { formatThaiDate } from '@/lib/utils';
import type { Wish } from '@/types';

interface WishCardProps {
  wish: Wish;
  compact?: boolean;
}

export function WishCard({ wish, compact = false }: WishCardProps) {
  return (
    <div
      className={[
        'rounded-[1.25rem] border border-[#e5e9e0] border-l-4 border-l-[#6b7c5e] bg-white shadow-[0_2px_16px_rgba(30,58,58,0.04)]',
        compact ? 'p-4' : 'p-5',
      ].join(' ')}
    >
      {!compact && (
        <p className="mb-1 text-[0.68rem] font-medium tracking-[0.08em] uppercase text-[#6b7c5e]">
          การ์ดอวยพร
        </p>
      )}
      <h3 className="font-serif-cg text-[1rem] font-medium text-[#1a3228] sm:text-[1.05rem]">
        {wish.guestName}
      </h3>
      <p
        className={[
          'mt-2 leading-relaxed text-[#2c2c2c]',
          compact ? 'line-clamp-2 text-xs italic' : 'text-sm italic',
        ].join(' ')}
      >
        &ldquo;{wish.message}&rdquo;
      </p>
      <p className="mt-3 text-[0.7rem] text-[#8a8a8a]">{formatThaiDate(wish.createdAt)}</p>
    </div>
  );
}
