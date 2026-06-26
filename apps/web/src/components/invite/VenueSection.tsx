import { WEDDING } from '@/lib/constants';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { MapPin } from 'lucide-react';

export function VenueSection() {
  return (
    <section id="details" className="relative overflow-hidden pt-6 pb-12 md:pt-14 md:pb-16">
      <FloralDecor preset="venue" />

      <div className="relative z-10 px-6 max-w-[680px] mx-auto text-center">
        <div className="reveal">
          <p className="text-[0.8rem] tracking-[0.1em] text-sage mb-2">สถานที่จัดงาน</p>
          <h2 className="font-display text-[2.5rem] text-teal-dark">Gathering</h2>
        </div>

        <div className="reveal bg-white rounded-2xl p-10 shadow-[0_8px_40px_rgba(30,58,58,0.08)] border border-sage-pale mt-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-gold to-sage-light" />

          <h3 className="font-serif-cg text-[1.4rem] font-normal text-teal-dark mb-2">
            {WEDDING.venue}
          </h3>
          <p className="text-sm text-text-light mb-6">{WEDDING.city}</p>

          <div className="divide-y divide-sage-pale text-left mb-6">
            {WEDDING.timeline.map((item) => (
              <div key={item.time} className="flex gap-4 items-start py-3">
                <span className="font-serif-cg text-[1.3rem] font-normal text-gold min-w-[60px]">
                  {item.time}
                </span>
                <span className="text-sm text-text leading-relaxed pt-0.5">{item.event}</span>
              </div>
            ))}
          </div>

          <a
            href={WEDDING.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sage text-gold-light text-xs font-medium tracking-[0.05em] font-thai transition-all hover:bg-teal-dark hover:text-gold hover:-translate-y-0.5"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ดูเส้นทาง
          </a>
        </div>
      </div>
    </section>
  );
}
