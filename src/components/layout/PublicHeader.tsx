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

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) =>
            item.protected ? (
              <ProtectedLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </ProtectedLink>
            ) : (
              <Link key={item.to} to="/" activeOptions={{ exact: true }} className={linkClass}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <ProtectedLink to="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </ProtectedLink>
              <Button size="sm" variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openLogin("/dashboard")}
              >
                Login
              </Button>
              <Link to="/signup">
                <Button size="sm" className="bg-brand-gradient text-white hover:opacity-95">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
