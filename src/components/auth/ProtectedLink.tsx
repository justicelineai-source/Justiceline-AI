import { Link } from "@tanstack/react-router";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useAuth } from "@/lib/auth";

type Props = Omit<ComponentProps<"a">, "href"> & {
  to: string;
  children: ReactNode;
};

/**
 * Navigates like a normal link when signed in; otherwise opens the login modal
 * and continues to `to` once authentication succeeds.
 */
export function ProtectedLink({ to, onClick, children, ...rest }: Props) {
  const { isAuthenticated, requireAuth } = useAuth();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth(to);
    }
  };

  return (
    <Link to={to as never} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
