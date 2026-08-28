import {
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      {/* Page Title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>

        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Notification */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
      </Button>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white transition-opacity hover:opacity-90">
            AK
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}