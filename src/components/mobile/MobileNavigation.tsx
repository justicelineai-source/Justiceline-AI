import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  History,
  Bookmark,
  User,
  Settings,
  Scale,
} from "lucide-react";

import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  onNavigate?: () => void;
  onOpenChatNavigation?: () => void;
};

const items = [
  {
    title: "Dashboard",
    to: "/dashboard" as const,
    icon: LayoutDashboard,
  },
  {
    title: "AI Chat",
    to: "/chat" as const,
    icon: MessageCircle,
  },
  {
    title: "Judgments",
    to: "/judgments" as const,
    icon: Scale,
  },
  {
    title: "Legal Draft",
    to: "/draft" as const,
    icon: FileText,
  },
  {
    title: "History",
    to: "/history" as const,
    icon: History,
  },
  {
    title: "Saved Drafts",
    to: "/saved" as const,
    icon: Bookmark,
  },
  {
    title: "Profile",
    to: "/profile" as const,
    icon: User,
  },
  {
    title: "Settings",
    to: "/settings" as const,
    icon: Settings,
  },
];

export function MobileNavigation({
  onNavigate,
  onOpenChatNavigation,
}: MobileNavigationProps) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <nav className="space-y-1">
      <div className="px-3 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
        Workspace
      </div>

      {items.map((item) => {
        const active =
          item.to === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.to);

        const content = (
  <>
    <item.icon
      className={cn(
        "h-5 w-5 shrink-0",
        active && "text-sidebar-primary",
      )}
    />

    <span className="flex-1 truncate">
      {item.title}
    </span>

    {active && (
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sidebar-primary" />
    )}
  </>
);

const itemClassName = cn(
  "flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
  active
    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
);

if (item.to === "/chat") {
  return (
    <button
      key={item.to}
      type="button"
      onClick={onOpenChatNavigation}
      className={itemClassName}
    >
      {content}
    </button>
  );
}

return (
  <Link
    key={item.to}
    to={item.to}
    onClick={onNavigate}
    className={itemClassName}
  >
    {content}
  </Link>
);
      })}
    </nav>
  );
}