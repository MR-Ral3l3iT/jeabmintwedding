type ButterflyVariant = 'gold' | 'sage' | 'cream';

interface ButterflySpriteProps {
  variant?: ButterflyVariant;
  /** ใส่ path รูป PNG/SVG ที่เพื่อนวาด — ถ้าไม่ใส่จะใช้ SVG placeholder */
  src?: string;
  className?: string;
}

const PALETTE: Record<ButterflyVariant, { wingA: string; wingB: string; stroke: string; body: string }> = {
  gold: { wingA: '#E8D5A3', wingB: '#C8A96E', stroke: '#A8894E', body: '#4A4035' },
  sage: { wingA: '#D4DDC8', wingB: '#8E9E80', stroke: '#6B7C5E', body: '#3D4A38' },
  cream: { wingA: '#FAF7F2', wingB: '#E8E0D0', stroke: '#B8A88A', body: '#5C5348' },
};

/** ผีเสื้อวาดมือ — placeholder รอแทนด้วยรูปจากเพื่อน */
export function ButterflySprite({ variant = 'gold', src, className = '' }: ButterflySpriteProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        className={[
          'h-full w-full object-contain select-none',
          'origin-center animate-butterfly-wing motion-reduce:animate-none',
          className,
        ].join(' ')}
      />
    );
  }

  const c = PALETTE[variant];

  return (
    <svg
      viewBox="0 0 72 52"
      fill="none"
      aria-hidden
      className={['h-full w-full', className].join(' ')}
    >
      <g className="origin-[36px_26px] animate-butterfly-wing motion-reduce:animate-none">
        <path
          d="M36 26C24 10 6 14 10 26C5 38 22 42 36 26Z"
          fill={c.wingA}
          fillOpacity={0.55}
          stroke={c.stroke}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M36 26C48 10 66 14 62 26C67 38 50 42 36 26Z"
          fill={c.wingB}
          fillOpacity={0.5}
          stroke={c.stroke}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
      </g>
      <ellipse cx="36" cy="26" rx="1.8" ry="9" fill={c.body} opacity={0.85} />
      <path
        d="M35 17 Q33 12 30 10 M37 17 Q39 12 42 10"
        stroke={c.body}
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle cx="30" cy="10" r="1" fill={c.body} opacity={0.6} />
      <circle cx="42" cy="10" r="1" fill={c.body} opacity={0.6} />
    </svg>
  );
}
