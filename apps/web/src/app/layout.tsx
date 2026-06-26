import type { Metadata } from 'next';
import { ScrollReveal } from '@/components/invite/ScrollReveal';
import { ASSETS } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jeab & Mint — Wedding Invitation',
  description: 'คุณได้รับเชิญสู่งานแต่งงานของ Jeab & Mint · 31 ตุลาคม 2569',
  openGraph: {
    title: 'Jeab & Mint — Wedding Invitation',
    description: 'คุณได้รับเชิญสู่งานแต่งงานของ Jeab & Mint · 31 ตุลาคม 2569',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preload" href={ASSETS.envelopeTexture} as="image" />
        <link rel="preload" href={ASSETS.cardTexture} as="image" />
      </head>
      <body>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
