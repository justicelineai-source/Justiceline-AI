import { Logo } from "@/components/brand/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms & Conditions</a>
          <a href="#" className="hover:text-foreground">Support</a>
        </nav>
        <span className="text-xs text-muted-foreground">Version 1.0 · © {new Date().getFullYear()} JusticeLine AI</span>
      </div>
    </footer>
  );
}
