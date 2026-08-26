import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  History,
  Bookmark,
  User,
  Settings,
  LogOut,
  Scale,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { displayName, initialsFor } from "@/lib/db/profiles";

const items = [
  { title: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { title: "AI Chat", to: "/chat" as const, icon: MessageCircle },
  { title: "Judgments", to: "/judgments" as const, icon: Scale },
  { title: "Legal Draft", to: "/draft" as const, icon: FileText },
  { title: "History", to: "/history" as const, icon: History },
  { title: "Saved Drafts", to: "/saved" as const, icon: Bookmark },
  { title: "Profile", to: "/profile" as const, icon: User },
  { title: "Settings", to: "/settings" as const, icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useAuth();

const name = displayName(profile) || "JusticeLine User";
const initials = initialsFor(profile);
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
  <Link to="/dashboard">
    <Logo
      variant="onDark"
      className="h-10"
    />
  </Link>
</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
          Workspace
        </div>
        {items.map((item) => {
          const active =
            item.to === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
              <span className="flex-1 truncate">{item.title}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient text-sm font-semibold text-gold-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Verified User</p>
          </div>
        </div>
        <button
  onClick={async () => {
    await signOut();
    window.location.href = "/";
  }}
  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
>
  <LogOut className="h-4 w-4" />
  Logout
</button>
      </div>
    </aside>
  );
}
