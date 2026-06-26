import Image from 'next/image';
import { Heart } from 'lucide-react';
import { ASSETS } from '@/lib/constants';

/** หัวใจในวงมาลัย — ตาม mockup ภาพรวม RSVP */
export function AdminHeartWreath() {
  return (
    <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
      <div className="pointer-events-none absolute inset-[-6px] opacity-50" aria-hidden>
        <Image
          src={ASSETS.flowers.f02}
          alt=""
          fill
          className="object-contain"
          sizes="88px"
        />
      </div>
      <div className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e5d4] bg-[#f3f7ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <Heart className="h-6 w-6 fill-[#6b7c5e]/15 text-[#6b7c5e]" aria-hidden="true" />
      </div>
    </div>
  );
}
