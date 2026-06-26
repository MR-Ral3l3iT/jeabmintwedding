'use client';

import { ChevronRight, Heart, MessageCircle, Phone } from 'lucide-react';
import { WEDDING } from '@/lib/constants';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { useInvite } from '@/components/invite/InviteContext';
import { useWeddingConfig } from '@/components/WeddingSettingsProvider';

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 text-gold">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
      <span className="text-[0.55rem]">✦</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
    </div>
  );
}

const RSVP_DEADLINE_LABEL = WEDDING.rsvpDeadline.toLocaleDateString('th-TH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function RsvpSection() {
  const config = useWeddingConfig();
  const { inviteToken, invite } = useInvite();
  const hasRsvp = Boolean(inviteToken && invite?.hasRsvp);

  function handleOpen() {
    window.dispatchEvent(new CustomEvent('open-rsvp-modal'));
  }

  return (
    <section
      id="rsvp"
      className="relative w-full overflow-hidden px-6 pb-14 pt-10 text-center md:px-8 md:pb-20 md:pt-14"
      style={{ background: 'linear-gradient(160deg, #1E3A3A 0%, #0F2626 100%)' }}
    >
      <FloralDecor preset="rsvp" />

      <div className="reveal relative z-10 mx-auto max-w-lg px-2">
        <h2 className="mb-5 font-display text-[clamp(2.5rem,10vw,3rem)] text-gold-light">
          {hasRsvp ? 'ขอบคุณค่ะ' : 'ยืนยันการเข้าร่วม'}
        </h2>

        <GoldDivider />

        {hasRsvp ? (
          <div className="my-8 text-left">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center">
              <p className="font-thai text-sm leading-relaxed text-white/85">
                {invite?.attending
                  ? 'เราได้รับการยืนยันเข้าร่วมงานของท่านแล้ว'
                  : 'เราได้รับการแจ้งของท่านแล้ว ขอบคุณที่แจ้งให้ทราบค่ะ'}
              </p>
              <p className="mt-3 inline-flex items-center justify-center gap-1.5 font-thai text-xs text-white/55">
                หากมีข้อสงสัย ติดต่อเจ้าบ่าวเจ้าสาวได้ตามช่องทางด้านล่างค่ะ
                <Heart className="h-3 w-3 text-gold-light/70" strokeWidth={1.8} aria-hidden />
              </p>
            </div>

            {invite?.attending && (
              <>
                <a
                  href={config.lineOaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-3 rounded-2xl bg-sage p-3.5 shadow-[0_6px_20px_rgba(107,124,94,0.28)] transition-colors hover:bg-teal-dark sm:p-4"
                >
                  <MessageCircle
                    className="h-6 w-6 shrink-0 text-gold-light"
                    strokeWidth={1.6}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-thai text-sm font-semibold text-white">เพิ่ม LINE OA</p>
                    <p className="mt-0.5 font-thai text-[0.68rem] leading-relaxed text-white/80">
                      เพื่อรับข้อมูลอัปเดตของงาน และแผนผังสถานที่จัดงาน
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <ChevronRight className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
                  </span>
                </a>

                <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Phone
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-light"
                    strokeWidth={1.6}
                    aria-hidden
                  />
                  <p className="font-thai text-[0.68rem] leading-relaxed text-white/60">
                    ไม่สามารถ @line ได้ ติดต่อได้ที่เบอร์
                    <br />
                    {config.groomNickname} :{' '}
                    <a
                      href={`tel:${config.rsvpContactPhone}`}
                      className="font-semibold text-gold-light underline-offset-2 transition-colors hover:text-white hover:underline"
                    >
                      {config.rsvpContactPhone}
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="mb-8 mt-5 font-serif-cg text-sm italic text-white/60 md:text-base">
              กรุณาตอบรับภายในวันที่ {RSVP_DEADLINE_LABEL}
            </p>

            <div className="mb-8 inline-block animate-rsvp-cta rounded-[60px] motion-reduce:animate-none">
              <button
                onClick={handleOpen}
                className="inline-block cursor-pointer rounded-[60px] px-10 py-4 font-thai text-[1rem] font-medium tracking-[0.04em] text-white transition-transform hover:scale-[1.03] md:px-12 md:text-[1.05rem]"
                style={{
                  background: 'linear-gradient(135deg, #C8A96E, #A8852E)',
                }}
              >
                ตอบรับ / ฝากคำอวยพร
              </button>
            </div>
          </>
        )}

        <GoldDivider />
      </div>
    </section>
  );
}
