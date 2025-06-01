
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Assuming this is the path to shadcn/ui navigation-menu
import {
  Gauge,
  Box,
  Truck,
  Wrench,
  ShieldAlert,
  ListChecks,
  Target,
  Settings,
  ClipboardList,
  FileCheck2,
  Warehouse as WarehouseIcon,
  ListOrdered,
  BellDot,
  FileText,
  Package as PackageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';


interface NavItem {
  href?: string;
  label: string;
  icon: React.ElementType;
  isParent?: boolean;
  children?: NavItem[];
}

const menuItems: NavItem[] = [
  { href: '/dashboard', label: 'ÖZET', icon: Gauge },
  {
    label: 'Envanter',
    icon: Box,
    isParent: true,
    children: [
      { href: '/inventory/firearms', label: 'Silahlar', icon: Target },
      { href: '/inventory/magazines', label: 'Şarjörler', icon: ListChecks },
      { href: '/inventory/ammunition', label: 'Mühimmat', icon: Box },
      { href: '/inventory/other-materials', label: 'Diğer Malzemeler', icon: PackageIcon },
    ],
  },
  { href: '/daily-ammo-usage', label: 'Günlük Kullanım', icon: ClipboardList },
  { href: '/maintenance', label: 'Bakım', icon: Wrench },
  { href: '/alerts', label: 'Uyarılar', icon: ShieldAlert },
  {
    label: 'Yönetim',
    icon: Settings,
    isParent: true,
    children: [
      { href: '/admin/firearms-definitions', label: 'Silah Tanımları', icon: Target },
      { href: '/admin/usage-scenarios', label: 'Kullanım Senaryoları', icon: FileCheck2 },
      { href: '/admin/depots', label: 'Depo Tanımları', icon: WarehouseIcon },
      { href: '/admin/shipment-types', label: 'Malzeme Kayıt Türleri', icon: ListOrdered },
      { href: '/shipments', label: 'Malzeme Kayıt Takibi', icon: Truck },
      { href: '/admin/alert-definitions', label: 'Uyarı Tanımları', icon: BellDot },
      { href: '/admin/audit-logs', label: 'Denetim Kayıtları', icon: FileText },
    ],
  },
];

interface MainNavProps {
  isMobile: boolean;
  onLinkClick?: () => void; // For mobile sheet to close on link click
}

export function MainNav({ isMobile, onLinkClick }: MainNavProps) {
  const pathname = usePathname();

  if (isMobile) {
    // Vertical list for mobile (inside Sheet)
    return (
      <ul className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => (
          <li key={item.label}>
            {item.isParent && item.children ? (
              // Basic accordion-like structure for mobile submenus - can be improved
              // For simplicity, we'll just list them now. A proper mobile submenu would need more state.
              <>
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <item.icon className="h-5 w-5" /> {item.label}
                </div>
                <ul className="pl-6">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href!}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname.startsWith(child.href!) ? "bg-accent text-accent-foreground" : "text-foreground"
                        )}
                        onClick={onLinkClick}
                        suppressHydrationWarning
                      >
                        <child.icon className="h-4 w-4" />
                        <span suppressHydrationWarning>{child.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname.startsWith(item.href!) ? "bg-accent text-accent-foreground" : "text-foreground"
                )}
                onClick={onLinkClick}
                suppressHydrationWarning
              >
                <item.icon className="h-5 w-5" />
                <span suppressHydrationWarning>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    );
  }

  // Horizontal NavigationMenu for desktop
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.isParent && item.children ? (
              <>
                <NavigationMenuTrigger className={cn(item.children.some(child => pathname.startsWith(child.href!)) && "bg-accent text-accent-foreground")}>
                  <item.icon className="h-5 w-5 mr-2" /> <span suppressHydrationWarning>{item.label}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.children.map((child) => (
                      <ListItem
                        key={child.label}
                        title={child.label}
                        href={child.href!}
                        icon={child.icon}
                        active={pathname.startsWith(child.href!)}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <Link href={item.href!} legacyBehavior passHref>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    "flex items-center gap-2",
                    pathname.startsWith(item.href!) && "bg-accent text-accent-foreground"
                  )}
                  active={pathname.startsWith(item.href!)}
                >
                  <item.icon className="h-5 w-5" />
                  <span suppressHydrationWarning>{item.label}</span>
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon: React.ElementType, active?: boolean }
>(({ className, title, children, icon: Icon, active, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            active && "bg-accent text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            <Icon className="h-4 w-4" />
            <span suppressHydrationWarning>{title}</span>
          </div>
          {children && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
