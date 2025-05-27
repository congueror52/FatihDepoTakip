'use client';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/MainNav';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import { Package2 } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground">
            <Package2 className="h-6 w-6 text-sidebar-primary" />
            <span suppressHydrationWarning>AmmoTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Altbilgi içeriği (varsa), ör. ayarlar düğmesi */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="sm:hidden" />
          <div className="ml-auto flex items-center space-x-4">
            {/* Gerekirse arama veya diğer başlık öğelerini buraya ekleyin */}
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
