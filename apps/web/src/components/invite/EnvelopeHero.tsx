'use client';

import { useEffect, useId, useState } from 'react';
import { ASSETS, HERO_GRADIENT } from '@/lib/constants';
import { EnvelopeSurface, GoldStamp } from '@/components/invite/EnvelopeParts';
import { FloralDecor } from '@/components/invite/FloralDecor';
import { FlyingButterflies } from '@/components/invite/FlyingButterflies';
import { useInvite } from '@/components/invite/InviteContext';

/** ขอบทองรอบซอง (ปิดไว้ — ลองแล้วชอบแบบไม่มีขอบนอก) */
const SHOW_ENVELOPE_OUTER_GOLD_BORDER = false;
/** เส้น V ด้านใน — แสดงตอนซองปิด ให้ดูว่าเปิดได้ */
const SHOW_ENVELOPE_INNER_SEAM_WHEN_CLOSED = true;

interface EnvelopeHeroProps {
  guestName?: string;
  showNameHints?: boolean;
}

function HintBadge({ num }: { num: string }) {
  return (
    <span className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-gold text-white text-[0.65rem] flex items-center justify-center shadow-md font-medium z-10">
      {num}
    </span>
  );
}

function CardGoldLine({ className = 'w-14' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`mx-auto h-[1.5px] rounded-full opacity-80 ${className}`}
      style={{ backgroundImage: `url(${ASSETS.goldFoil})`, backgroundSize: 'cover' }}
    />
  );
}

export function EnvelopeHero({ guestName, showNameHints }: EnvelopeHeroProps) {
  const [opened, setOpened] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const { setEnvelopeOpened } = useInvite();

  const clipUid = useId().replace(/:/g, '');
  const flapClip = `url(#${clipUid}-flap)`;
  const pocketClip = `url(#${clipUid}-pocket)`;

  // เส้นทอง — พิกัด 380×250 ตรงกับ clip-path กระเป๋า (0.037×380=14.06, 0.963×380=365.94)
  const goldStroke = { stroke: '#D4B87A', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const outerBorderClosed = 'M 14 1.25 H 366 Q 378.75 1.25 378.75 14 V 236 Q 378.75 248.75 366 248.75 H 14 Q 1.25 248.75 1.25 236 V 14 Q 1.25 1.25 14 1.25 Z';
  const outerBorderOpen =
    'M 340 1.25 H 365.94 Q 378.75 1.25 378.75 14 V 236 Q 378.75 248.75 366 248.75 H 14 Q 1.25 248.75 1.25 236 V 14 Q 1.25 1.25 14.06 1.25 H 40';
  const vSeamClosed = 'M 14.06 0 L 178.6 145 Q 190 155 201.4 145 L 365.94 0';
  const vSeamOpen =
    'M 14.06 1.25 L 14.06 0 L 178.6 145 Q 190 155 201.4 145 L 365.94 0 L 365.94 1.25';

  function handleOpen() {
    if (opened) return;
    setOpened(true);
    setEnvelopeOpened(true);
    requestAnimationFrame(() => setFlapOpen(true));
    window.setTimeout(() => setFlapBehind(true), 950);
  }

  /** ล็อก scroll จนกว่าจะเปิดซอง */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (opened) {
      html.style.overflow = '';
      body.style.overflow = '';
      return;
    }

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, [opened]);

  return (
    <section
      id="hero"
      className={[
        'relative isolate flex w-full max-w-none flex-col',
        opened ? 'min-h-[100dvh]' : 'h-[100dvh] overflow-hidden',
      ].join(' ')}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: HERO_GRADIENT }}
      />
      {/* ดอกไม้ตกแต่ง */}
      <FloralDecor preset="hero" />
      {!opened && <FloralDecor preset="hero-closed" />}
      {!opened && <FlyingButterflies />}
      {opened && <FloralDecor preset="hero-open" />}

      {/* ก้อนเนื้อหาหลัก — จัดกลางแนวตั้งก่อนเปิดซอง (mobile-first) */}
      <div
        className={[
          'relative z-10 flex w-full min-w-0 flex-col items-center px-5 py-8 sm:px-6',
          opened
            ? 'flex-none pt-[clamp(7.5rem,23vh,10.5rem)] md:pt-[clamp(4.75rem,13vh,6.25rem)] transition-[padding] duration-500 ease-out'
            : 'flex-1 justify-center',
        ].join(' ')}
      >
      {/* Hero top — ซ่อนเมื่อเปิดซอง */}
      <div
        className={[
          'relative text-center transition-all duration-500 ease-out',
          opened
            ? 'mb-0 max-h-0 overflow-hidden opacity-0 invisible pointer-events-none'
            : 'mb-4 opacity-0 animate-[fadeUp_1s_ease_2s_forwards]',
        ].join(' ')}
      >
        <p className="text-xs tracking-[0.1em] text-sage mb-2 font-thai">เรียนเชิญ</p>
        <p className="relative inline-block font-display text-[clamp(1.85rem,8vw,2.5rem)] md:text-3xl text-teal-dark">
          {showNameHints && guestName && <HintBadge num="①" />}
          {guestName ?? 'ยินดีต้อนรับ'}
        </p>
      </div>

      {/* Envelope — การ์ดโผล่ด้านบน ซองบังด้านล่าง */}
      <div
        className={[
          'relative perspective-1200 select-none mx-auto w-full',
          'max-w-[380px] md:max-w-[320px] lg:max-w-[300px]',
          opened ? 'mb-0 overflow-visible translate-y-[clamp(1rem,3.5vh,1.75rem)] transition-transform duration-500 ease-out' : 'mb-8 cursor-pointer',
        ].join(' ')}
        onClick={opened ? undefined : handleOpen}
        role={opened ? undefined : 'button'}
        aria-label={opened ? undefined : 'แตะเพื่อเปิดซอง'}
        tabIndex={opened ? -1 : 0}
        onKeyDown={opened ? undefined : (e) => e.key === 'Enter' && handleOpen()}
      >
        <div
          className={[
            'relative w-full transition-transform duration-500',
            !opened ? 'md:hover:-translate-y-2' : '',
          ].join(' ')}
          style={{
            paddingTop: opened ? '80px' : '56px',
            transition: 'padding-top 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* กล่องซอง — มุมโค้ง + ขอบทอง (ไม่ clip การ์ดตอนเปิด) */}
          <div
            className="relative aspect-[380/250] w-full"
            style={{
              filter:
                'drop-shadow(0 30px 46px rgba(19,42,44,0.34)) drop-shadow(0 10px 18px rgba(19,42,44,0.18))',
            }}
          >
            {/* clip-path มุมโค้ง 14px สำหรับฝา + กระเป๋า */}
            <svg width="0" height="0" className="absolute" aria-hidden>
              <defs>
                <clipPath id={`${clipUid}-flap`} clipPathUnits="objectBoundingBox">
                  <path d="M 0.037,0 H 0.963 Q 1,0 0.978,0.045 L 0.53,0.58 Q 0.5,0.62 0.47,0.58 L 0.022,0.045 Q 0,0 0.037,0 Z" />
                </clipPath>
                <clipPath id={`${clipUid}-pocket`} clipPathUnits="objectBoundingBox">
                  {/* มุมล่างโค้ง 14px (0.037×380, 0.056×250) */}
                  <path d="M 0,0.944 Q 0,1 0.037,1 H 0.963 Q 1,1 1,0.944 V 0.056 Q 1,0 0.963,0 L 0.53,0.58 Q 0.5,0.62 0.47,0.58 L 0.037,0 Q 0,0 0,0.056 V 0.944 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* แผงหลังซอง */}
            <div className="absolute inset-0 z-[1] overflow-hidden rounded-[14px]">
              <EnvelopeSurface className="absolute inset-0" />
            </div>

            {/* การ์ด — อยู่ในซองเสมอ (หลังกระเป๋าหน้า) โผล่แค่ส่วนบนเมื่อเปิด */}
            <div
              className="absolute left-1/2 top-[5.5%] z-[5] w-[73%]"
              style={{
                transform: opened
                  ? 'translateX(-50%) translateY(-14%)'
                  : 'translateX(-50%) translateY(0)',
                transition: 'transform 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.32s',
                willChange: opened ? 'transform' : 'auto',
              }}
            >
              <div className="relative overflow-hidden rounded-[12px] border border-[#E0D6BF]/90 shadow-[0_8px_22px_rgba(0,0,0,0.16)] min-h-[clamp(148px,40vw,172px)] md:min-h-[158px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ASSETS.cardTexture}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-[12px] pointer-events-none select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none" />
                {/* เงาจากกระเป๋าซองทับการ์ด — ตอนเปิดให้ดูอยู่ในซอง */}
                {flapOpen && (
                  <div
                    aria-hidden
                    className="absolute inset-0 z-[2] rounded-[12px] pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(158deg, rgba(19,42,44,0.22) 0%, rgba(19,42,44,0.06) 18%, transparent 38%),
                        linear-gradient(202deg, rgba(19,42,44,0.22) 0%, rgba(19,42,44,0.06) 18%, transparent 38%),
                        linear-gradient(to bottom, transparent 48%, rgba(19,42,44,0.1) 62%, rgba(19,42,44,0.28) 78%, rgba(19,42,44,0.14) 92%)
                      `,
                      transition: 'opacity 0.6s ease',
                    }}
                  />
                )}
                <div className="relative z-[1] flex min-h-[clamp(148px,40vw,172px)] md:min-h-[158px] flex-col items-center justify-start gap-1 px-4 pt-4 pb-3 text-center">
                  {showNameHints && guestName && <HintBadge num="②" />}
                  <p className="font-thai text-[0.72rem] md:text-[0.65rem] font-medium tracking-[0.18em] text-gold">
                    เรียนเชิญ
                  </p>
                  <p className="font-thai text-[clamp(1.12rem,5.8vw,1.3rem)] md:text-[1.08rem] font-medium text-teal-dark leading-snug px-1 pb-7">
                    {guestName ?? 'ยินดีต้อนรับ'}
                  </p>
                  <CardGoldLine className="w-9" />
                  <p className="font-thai text-[0.58rem] tracking-[0.1em] text-sage/90 leading-relaxed">
                    สู่พิธีมงคลสมรส
                  </p>
                </div>
              </div>
            </div>

            {/* กระเป๋าหน้าซอง — ขอบบนเป็นสามเหลี่ยมพับลง */}
            <div
              className={[
                'absolute inset-0 z-[15] rounded-[14px]',
                flapOpen ? 'overflow-visible' : 'overflow-hidden',
              ].join(' ')}
            >
              <div
                className="absolute inset-0"
                style={{
                  clipPath: pocketClip,
                  filter: flapOpen
                    ? 'drop-shadow(0 8px 16px rgba(19,42,44,0.36)) drop-shadow(0 3px 7px rgba(19,42,44,0.24))'
                    : undefined,
                  transition: 'filter 0.55s ease',
                }}
              >
                <EnvelopeSurface className="absolute inset-0" />
                {/* เงาขอบบนกระเป๋า — ตอนปิด */}
                {!flapOpen && (
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(175deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 18%, transparent 42%)',
                    }}
                  />
                )}
                {/* เงาขอบ V ด้านใน — ตอนเปิด ให้ขอบสามเหลี่ยมมีมิติ */}
                {flapOpen && (
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(154deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.1) 20%, transparent 42%),
                        linear-gradient(206deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.1) 20%, transparent 42%),
                        linear-gradient(to bottom, transparent 54%, rgba(0,0,0,0.14) 64%, rgba(0,0,0,0.26) 74%, transparent 88%)
                      `,
                    }}
                  />
                )}
              </div>
            </div>

            {/* ฝาบนซอง — พับขึ้นเห็นด้านหลังการ์ด */}
            <div
              className={[
                'absolute inset-0 perspective-[1000px]',
                flapBehind ? 'z-[4]' : 'z-[20]',
              ].join(' ')}
            >
              <div className="absolute inset-0 overflow-visible">
                <div
                  className="absolute inset-0"
                  style={{
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                    transform: flapOpen ? 'rotateX(-155deg)' : 'rotateX(0deg)',
                    transition:
                      'transform 1.1s cubic-bezier(0.4, 0, 0.2, 1), filter 0.45s ease',
                    clipPath: flapClip,
                    willChange: flapOpen ? 'transform' : 'auto',
                    filter: flapOpen
                      ? undefined
                      : 'drop-shadow(0 10px 18px rgba(19,42,44,0.32)) drop-shadow(0 4px 8px rgba(19,42,44,0.2))',
                  }}
                >
                  <EnvelopeSurface className="absolute inset-0" />
                </div>
              </div>
            </div>

            {/* เส้นทอง — ขอบนอก (ถ้าเปิด) + รอยต่อ V ตอนปิด */}
            {(SHOW_ENVELOPE_OUTER_GOLD_BORDER ||
              (!opened && SHOW_ENVELOPE_INNER_SEAM_WHEN_CLOSED)) && (
              <div
                className={[
                  'absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none',
                  opened ? 'z-[16]' : 'z-[22]',
                ].join(' ')}
              >
                <svg className="w-full h-full" viewBox="0 0 380 250" fill="none" aria-hidden="true">
                  {SHOW_ENVELOPE_OUTER_GOLD_BORDER && (
                    <path
                      d={opened ? outerBorderOpen : outerBorderClosed}
                      {...goldStroke}
                      opacity={0.95}
                    />
                  )}
                  {!opened && SHOW_ENVELOPE_INNER_SEAM_WHEN_CLOSED && (
                    <path d={vSeamClosed} {...goldStroke} opacity={0.88} />
                  )}
                  {opened && SHOW_ENVELOPE_OUTER_GOLD_BORDER && (
                    <path d={vSeamOpen} {...goldStroke} opacity={0.92} />
                  )}
                </svg>
              </div>
            )}

            {/* ตราปั้มทอง — อยู่ที่ยอดซองตลอด (ทั้งปิดและเปิด) */}
            <div
              className="absolute left-1/2 z-[25]"
              style={{ top: '62%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="scale-110 md:scale-[0.88]">
                <GoldStamp size={84} />
              </div>
            </div>
          </div>
        </div>

        {/* Tap hint */}
        {!opened && (
        <div className="text-center mt-4">
          <p className="font-serif-cg text-sm text-sage tracking-[0.08em] opacity-70 animate-float">
            แตะเพื่อเปิดซอง ✦
          </p>
        </div>
        )}
      </div>
      </div>

      {/* Names — กลางช่องว่างระหว่างซองกับ เลื่อนลง */}
      {opened && (
        <div className="relative z-10 flex w-full min-h-0 flex-1 items-center justify-center px-4 pb-28">
          <div className="text-center opacity-0 animate-[fadeUp_0.8s_ease_0.9s_forwards]">
            <p className="font-thai text-[clamp(0.75rem,3.4vw,0.9rem)] tracking-[0.14em] text-sage mb-3">
              พิธีมงคลสมรสของ
            </p>
            <p className="font-display text-[clamp(3rem,12vw,4.5rem)] md:text-[3.25rem] lg:text-[3rem] text-teal-dark leading-none">
              Jeab <span className="text-gold text-[0.7em]">&</span> Mint
            </p>
            <p className="font-serif-cg text-lg md:text-base tracking-[0.1em] text-sage mt-3">
              31 ตุลาคม 2569
            </p>
          </div>
        </div>
      )}

      {/* Scroll down — แสดงหลังเปิดซองแล้วเท่านั้น */}
      {opened && (
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-sage text-[0.7rem] tracking-[0.08em] cursor-pointer opacity-0 animate-[fadeIn_1s_ease_0.9s_forwards]"
        onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="w-px h-10 bg-gradient-to-b from-sage to-transparent animate-scroll-pulse" />
        <span>เลื่อนลง</span>
      </div>
      )}
    </section>
  );
}
