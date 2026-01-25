import type { Metadata } from 'next';
import Script from 'next/script';
import * as Sentry from '@sentry/nextjs';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FeedbackButton } from '@/components/feedback-button';
import './globals.css';

const GA_MEASUREMENT_ID = 'G-CGD9K892KP';

export function generateMetadata(): Metadata {
  return {
    title: 'NotRenewing - Domain Marketplace',
    description: 'Buy and sell non-renewal domains at a fixed $99 price',
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FeedbackButton />
      </body>
    </html>
  );
}
