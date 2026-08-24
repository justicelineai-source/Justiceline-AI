import { useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { MobileNavigation } from "./MobileNavigation";
import { MobileChatNavigation } from "./MobileChatNavigation";
import { useAuth } from "@/lib/auth";
import { displayName, initialsFor } from "@/lib/db/profiles";

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileSidebar({
  open,
  onOpenChange,
}: MobileSidebarProps) {
  const { profile, signOut } = useAuth();
const [showChatNavigation, setShowChatNavigation] = useState(false);
  const name = displayName(profile) || "JusticeLine User";
  const initials = initialsFor(profile);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[85vw] max-w-[320px] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">
          JusticeLine AI navigation
        </SheetTitle>

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          <Link
            to="/dashboard"
            onClick={() => onOpenChange(false)}
          >
            <Logo className="h-10" />
          </Link>
        </div>

       {/* Navigation */}
<div className="min-h-0 flex-1 overflow-y-auto p-3">
  {showChatNavigation ? (
    <div className="flex h-full flex-col">
      
      {/* Back button */}
      <button
        type="button"
        onClick={() => setShowChatNavigation(false)}
        className="mb-4 flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Menu
      </button>

     {/* Chat Navigation */} 
<div className="min-h-0 flex-1"> 
  <MobileChatNavigation
    onNewChat={() => {
      console.log("New Chat clicked");
    }}
  />
</div>
    </div>
  ) : (
    <MobileNavigation
  onNavigate={() => onOpenChange(false)}
  onOpenChatNavigation={() => setShowChatNavigation(true)}
/>
  )}
</div>

        {/* User */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-gradient text-sm font-semibold text-gold-foreground">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {name}
              </p>

              <p className="truncate text-xs text-sidebar-foreground/60">
                Verified User
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}