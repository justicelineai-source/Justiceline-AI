import * as React from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export const MOBILE_MAX = 767;
export const TABLET_MIN = 768;
export const DESKTOP_MIN = 1024;

function read(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < TABLET_MIN) return "mobile";
  if (w < DESKTOP_MIN) return "tablet";
  return "desktop";
}

/**
 * Returns the current breakpoint. Before hydration it reports "desktop" so
 * SSR markup stays stable; the real value lands on the first effect tick.
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = React.useState<Breakpoint>("desktop");

  React.useEffect(() => {
    const update = () => setBp(read());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export function useIsTouchLayout() {
  const bp = useBreakpoint();
  return bp !== "desktop";
}
