'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) py-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {(() => {
            const lastSegment = pathname?.split('/')?.pop()?.replace('-', ' ');
            return lastSegment
              ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
              : 'Dashboard';
          })()}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

const UserMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
