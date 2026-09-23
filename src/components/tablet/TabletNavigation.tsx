import { Link, useRouterState } from "@tanstack/react-router";
import { workspaceNavItems, isNavItemActive } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

/** Icon rail navigation for 768–1023px. Labels sit under each icon. */
export function TabletNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex w-full flex-col items-stretch gap-1 px-2">
      {workspaceNavItems.map((item) => {
        const active = isNavItemActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            title={item.title}
            className={cn(
              "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-center transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("h-5 w-5", active && "text-sidebar-primary")} />
            <span className="w-full truncate text-[10px] font-medium leading-tight">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
