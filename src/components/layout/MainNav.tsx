
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Gauge,
  Box,
  Truck,
  Wrench,
  BrainCircuit,
  ShieldAlert,
  ListChecks,
  Target,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Gösterge Paneli', icon: Gauge },
  { href: '/inventory/firearms', label: 'Ateşli Silahlar', icon: Target },
  { href: '/inventory/magazines', label: 'Şarjörler', icon: ListChecks },
  { href: '/inventory/ammunition', label: 'Mühimmat', icon: Box },
  { href: '/shipments', label: 'Malzeme Kaydı', icon: Truck },
  { href: '/maintenance', label: 'Bakım', icon: Wrench },
  { href: '/ai-balancing', label: 'Yapay Zeka Stok Dengeleme', icon: BrainCircuit },
  { href: '/alerts', label: 'Uyarılar', icon: ShieldAlert },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-4">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
              <item.icon className="h-5 w-5" />
              <span suppressHydrationWarning>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
