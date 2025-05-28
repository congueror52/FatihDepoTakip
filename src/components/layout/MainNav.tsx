
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
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
  Settings, 
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Gösterge Paneli', icon: Gauge },
  { href: '/inventory/firearms', label: 'Silahlar', icon: Target },
  { href: '/inventory/magazines', label: 'Şarjörler', icon: ListChecks },
  { href: '/inventory/ammunition', label: 'Mühimmat', icon: Box },
  { href: '/daily-ammo-usage', label: 'Günlük Fişek Kullanımı', icon: ClipboardList },
  { href: '/shipments', label: 'Malzeme Kaydı', icon: Truck },
  { href: '/maintenance', label: 'Bakım', icon: Wrench },
  { href: '/ai-balancing', label: 'Yapay Zeka Stok Dengeleme', icon: BrainCircuit },
  { href: '/alerts', label: 'Uyarılar', icon: ShieldAlert },
  {
    label: 'Yönetim Paneli',
    icon: Settings,
    isParent: true,
    children: [
      { href: '/admin/firearms-definitions', label: 'Silah Tanımları', icon: Target },
      { href: '/admin/usage-scenarios', label: 'Kullanım Senaryoları', icon: FileCheck2 },
    ]
  }
];

export function MainNav() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{[key: string]: boolean}>({});

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({...prev, [label]: !prev[label]}));
  };

  useEffect(() => {
    const initialOpenMenus: {[key: string]: boolean} = {};
    let parentLabelToOpen: string | null = null;

    menuItems.forEach(item => {
      if (item.isParent && item.children) {
        if (item.children.some(child => pathname.startsWith(child.href))) {
          parentLabelToOpen = item.label;
        }
      }
    });
    if (parentLabelToOpen) {
      initialOpenMenus[parentLabelToOpen] = true;
    }
    setOpenMenus(initialOpenMenus);
  }, [pathname]);


  return (
    <SidebarMenu className="p-4">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.isParent && item.children ? (
            <>
              <SidebarMenuButton 
                onClick={() => toggleMenu(item.label)}
                className="justify-between"
                isActive={item.children.some(child => pathname.startsWith(child.href))}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span suppressHydrationWarning>{item.label}</span>
                </div>
                {openMenus[item.label] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </SidebarMenuButton>
              {openMenus[item.label] && (
                <SidebarMenuSub>
                  {item.children.map(child => (
                     <SidebarMenuItem key={child.href}>
                        <Link href={child.href} legacyBehavior passHref>
                          <SidebarMenuSubButton isActive={pathname.startsWith(child.href)}>
                            <child.icon className={cn("h-4 w-4", pathname.startsWith(child.href) ? "text-sidebar-primary" : "")} />
                            <span suppressHydrationWarning>{child.label}</span>
                          </SidebarMenuSubButton>
                        </Link>
                     </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            <Link href={item.href!} legacyBehavior passHref>
              <SidebarMenuButton isActive={pathname.startsWith(item.href!)}>
                <item.icon className="h-5 w-5" />
                <span suppressHydrationWarning>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
