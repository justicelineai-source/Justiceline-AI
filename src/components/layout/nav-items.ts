import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  History,
  Bookmark,
  User,
  Settings,
  Scale,
} from "lucide-react";

/** Single source of truth for workspace navigation (desktop, tablet, mobile). */
export const workspaceNavItems = [
  { title: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { title: "AI Chat", to: "/chat" as const, icon: MessageCircle },
  { title: "Judgments", to: "/judgments" as const, icon: Scale },
  { title: "Legal Draft", to: "/draft" as const, icon: FileText },
  { title: "History", to: "/history" as const, icon: History },
  { title: "Saved Drafts", to: "/saved" as const, icon: Bookmark },
  { title: "Profile", to: "/profile" as const, icon: User },
  { title: "Settings", to: "/settings" as const, icon: Settings },
];

export function isNavItemActive(pathname: string, to: string) {
  return to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);
}
