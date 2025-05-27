'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Gauge,
  Box,
  Warehouse,
  Truck,
  Wrench,
  BrainCircuit,
  AlertTriangle,
  ChevronDown,
  ListChecks,
  Target,
  Replace,
  ShieldAlert
} from 'lucide-react';
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  {
    label: 'Inventory',
    icon: Warehouse,
    subItems: [
      { href: '/inventory/firearms', label: 'Firearms', icon: Target },
      { href: '/inventory/magazines', label: 'Magazines', icon: ListChecks },
      { href: '/inventory/ammunition', label: 'Ammunition', icon: Box },
    ],
  },
  { href: '/shipments', label: 'Shipments', icon: Truck },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/ai-balancing', label: 'AI Stock Balancing', icon: BrainCircuit },
  { href: '/alerts', label: 'Alerts', icon: ShieldAlert },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-4">
      {menuItems.map((item) =>
        item.subItems ? (
          <Accordion.Root type="single" collapsible key={item.label} className="w-full">
            <Accordion.Item value={item.label} className="border-none">
              <Accordion.Trigger asChild>
                <SidebarMenuItem className="p-0">
                  <SidebarMenuButton
                    className={cn(
                      "flex w-full justify-between items-center",
                      item.subItems.some(sub => pathname.startsWith(sub.href)) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 accordion-chevron" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <SidebarMenuSub className="ml-4 my-1">
                  {item.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <Link href={subItem.href} legacyBehavior passHref>
                        <SidebarMenuSubButton
                          isActive={pathname.startsWith(subItem.href)}
                          className="pl-6"
                        >
                          <subItem.icon className="h-4 w-4 mr-2" />
                          {subItem.label}
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </Accordion.Content>
            </Accordion.Item>
             <style jsx global>{`
              .accordion-chevron[data-state='open'] {
                transform: rotate(180deg);
              }
            `}</style>
          </Accordion.Root>
        ) : (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
