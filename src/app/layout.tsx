import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ImageFallback } from '@/components/behaviors/image-fallback';
import { SkipLink } from '@/components/layout/skip-link';
import { SITE } from '@/content/site';
import { buildJsonLd, serializeJsonLd } from '@/features/seo/json-ld';
import { ClickTracker } from '@/features/tracking/click-tracker';
import { bodyFont, headingFont } from './fonts';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: SITE.name, title: SITE.title, description: SITE.description, url: '/' },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF9F5',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd(SITE_URL)) }} />
        <SkipLink />
        {children}
        <ClickTracker />
        <ImageFallback />
      </body>
    </html>
  );
}
