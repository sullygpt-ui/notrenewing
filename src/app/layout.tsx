import type { Metadata } from 'next';
import * as Sentry from '@sentry/nextjs';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FeedbackButton } from '@/components/feedback-button';
import './globals.css';

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
      <body className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FeedbackButton />
      </body>
    </html>
  );
}
