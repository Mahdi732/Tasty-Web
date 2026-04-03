import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tasty — Dev Console',
  description: 'Test Auth, Restaurant, and Order APIs through the Tasty API Gateway',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={` ${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
