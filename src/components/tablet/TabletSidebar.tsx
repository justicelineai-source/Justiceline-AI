import { Link } from "@tanstack/react-router";
import { LogOut, Scale } from "lucide-react";
import { TabletNavigation } from "./TabletNavigation";
import { useAuth } from "@/lib/auth";
import { initialsFor } from "@/lib/db/profiles";

export const TABLET_SIDEBAR_WIDTH = 84;

/** Narrow collapsed sidebar rail used between 768px and 1023px. */
export function TabletSidebar() {
  const { profile, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[84px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border">
        <Link to="/dashboard" aria-label="JusticeLine AI">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-gradient text-gold-foreground">
            <Scale className="h-5 w-5" />
          </span>
        </Link>
      </div>
      <div className="flex-1 py-2">
  <TabletNavigation />
</div>
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-gold-gradient text-xs font-semibold text-gold-foreground">
          {initialsFor(profile)}
        </div>
        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          aria-label="Logout"
          className="flex min-h-[44px] w-full flex-col items-center justify-center gap-1 rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-[10px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
