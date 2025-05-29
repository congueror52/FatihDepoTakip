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
  title: 'Fatih - Depo Yönetim Sistemi',
  description: 'Depolar arası  silahları, şarjörleri ve mühimmatı takip edin ve yönetin.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
