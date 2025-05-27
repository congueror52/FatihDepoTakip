import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Using Geist as it's a clean sans-serif
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {Providers} from "@/components/layout/Providers";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AmmoTrack - Depot Management System',
  description: 'Track and manage firearms, magazines, and ammunition across depots.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
