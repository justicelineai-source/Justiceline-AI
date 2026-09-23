import { Link } from "@tanstack/react-router";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { initialsFor } from "@/lib/db/profiles";

/** Header for 768–1023px: keeps desktop structure with a condensed search. */
export function TabletHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="relative w-44 shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search…"
          aria-label="Search judgments, drafts, chats"
          className="h-11 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/40 focus:bg-background"
        />
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Account menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white hover:opacity-90"
          >
            {initialsFor(profile)}
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
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
