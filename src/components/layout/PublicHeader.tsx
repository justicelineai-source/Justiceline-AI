import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ProtectedLink } from "@/components/auth/ProtectedLink";
import { useAuth } from "@/lib/auth";

const nav = [
  { label: "Home", to: "/", protected: false },
  { label: "AI Chat", to: "/chat", protected: true },
  { label: "Legal Draft", to: "/draft", protected: true },
  { label: "History", to: "/history", protected: true },
  { label: "Saved Drafts", to: "/saved", protected: true },
];

export function PublicHeader() {
  const { isAuthenticated, openLogin, signOut } = useAuth();

  const linkClass =
    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:text-primary";

  const mobileLinkClass =
    "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      
      {/* =====================================================
          TOP HEADER
          ===================================================== */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center">
          <Logo />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
            Hidden on mobile
            ===================================================== */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) =>
            item.protected ? (
              <ProtectedLink
                key={item.to}
                to={item.to}
                className={linkClass}
              >
                {item.label}
              </ProtectedLink>
            ) : (
              <Link
                key={item.to}
                to="/"
                activeOptions={{ exact: true }}
                className={linkClass}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* =====================================================
            RIGHT SIDE BUTTONS
            ===================================================== */}
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <ProtectedLink
                to="/dashboard"
                className="hidden sm:block"
              >
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </ProtectedLink>

              <Button
                size="sm"
                variant="outline"
                onClick={signOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              {/* Login only tablet and desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openLogin("/dashboard")}
              >
                Login
              </Button>

              <Link to="/signup">
                <Button
                  size="sm"
                  className="bg-brand-gradient text-white hover:opacity-95"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
          Visible only below md (768px)
          Scrollable, but scrollbar is invisible
          ===================================================== */}
      <nav className="border-t border-border/60 px-3 py-2 md:hidden">
        <div
          className="
            flex
            w-full
            items-center
            gap-1
            overflow-x-auto
            scrollbar-none
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {nav.map((item) =>
            item.protected ? (
              <ProtectedLink
                key={item.to}
                to={item.to}
                className={mobileLinkClass}
              >
                {item.label}
              </ProtectedLink>
            ) : (
              <Link
                key={item.to}
                to="/"
                activeOptions={{ exact: true }}
                className={mobileLinkClass}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </header>
  );
}