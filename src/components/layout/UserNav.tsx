
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher"; // Added ThemeSwitcher
import { User, Settings, LogOut, Palette } from 'lucide-react'; // Added Palette

export function UserNav() {
  const user = { name: 'Admin Kullanıcısı', email: 'admin@ammotrack.com', avatarUrl: 'https://placehold.co/40x40.png' };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="kullanıcı avatarı" />
            <AvatarFallback>{user.name?.charAt(0) || 'K'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span suppressHydrationWarning>Profil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <Popover>
            <PopoverTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Palette className="mr-2 h-4 w-4" />
                <span suppressHydrationWarning>Tema Ayarları</span>
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" sideOffset={8}>
              <ThemeSwitcher />
            </PopoverContent>
          </Popover>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span suppressHydrationWarning>Ayarlar</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span suppressHydrationWarning>Çıkış Yap</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
