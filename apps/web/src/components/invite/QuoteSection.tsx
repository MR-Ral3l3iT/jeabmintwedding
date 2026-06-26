import { FloralDecor } from '@/components/invite/FloralDecor';

export function QuoteSection() {
  return (
    <section
      id="quote"
      className="relative w-full px-8 text-center overflow-hidden bg-teal-dark pt-24 pb-12 md:py-16"
    >
      <FloralDecor preset="quote" />

      <blockquote className="reveal relative z-10 max-w-lg mx-auto">
        <p className="font-serif-cg-bold text-[clamp(1.15rem,3.2vw,1.5rem)] italic text-gold-light leading-[1.8] mb-4">
          &ldquo;เหนือสิ่งอื่นใด
          <br />
          จงรักกันและกันอย่างจริงใจ&rdquo;
        </p>
        <cite className="reveal text-xs tracking-[0.08em] text-sage-pale not-italic font-serif-cg">
          1 เปโตร 4:8
        </cite>
      </blockquote>
    </section>
  );
}
