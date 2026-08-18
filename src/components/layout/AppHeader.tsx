import {
  Bell,
  Search,
  Command,
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
export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search judgments, drafts, chats…"
          className="h-10 w-80 rounded-lg border border-input bg-secondary/50 pl-10 pr-16 text-sm outline-none transition-colors focus:border-primary/40 focus:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
      </Button>
      <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white hover:opacity-90">
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
