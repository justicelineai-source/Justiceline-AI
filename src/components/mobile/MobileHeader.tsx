import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

type MobileHeaderProps = {
  onMenuClick: () => void;
};

export function MobileHeader({
  onMenuClick,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="grid h-10 w-10 place-items-center rounded-lg text-foreground/80 transition-colors hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        to="/dashboard"
        className="flex items-center"
      >
        <Logo />
      </Link>

      <div className="h-10 w-10" />
    </header>
  );
}