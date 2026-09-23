import type { ReactNode } from "react";
import { TabletSidebar } from "./TabletSidebar";

/** Shell for 768–1023px: narrow icon rail + full-width content column. */
export function TabletLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <TabletSidebar />
      <div className="ml-[84px] flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
