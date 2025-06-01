
'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { MainNav } from '@/components/layout/MainNav';
// import { UserNav } from '@/components/layout/UserNav'; // UserNav kaldırıldı
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Warehouse } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: ReactNode }) {
  const [openMobileNav, setOpenMobileNav] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <div className="flex items-center gap-2">
          <Sheet open={openMobileNav} onOpenChange={setOpenMobileNav}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only" suppressHydrationWarning>Navigasyon menüsünü aç/kapat</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-4 border-b">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setOpenMobileNav(false)}
                >
                  <Warehouse className="h-6 w-6 text-primary" />
                  <span suppressHydrationWarning>Depo Takip</span>
                </Link>
              </div>
              <nav className="flex-grow overflow-y-auto">
                <MainNav isMobile={true} onLinkClick={() => setOpenMobileNav(false)} />
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Warehouse className="h-6 w-6 text-primary" />
            <span className="sr-only sm:not-sr-only" suppressHydrationWarning>Depo Takip</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <MainNav isMobile={false} />
        </div>

        {/* UserNav bölümü kaldırıldı */}
        {/* <div className="ml-auto flex items-center gap-4">
          <UserNav />
        </div> */}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
