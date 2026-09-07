import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MessageCircle,
  FileText,
  MoreHorizontal,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  loadConversations,
  saveConversations,
  setActiveId,
  type Conversation,
} from "@/lib/chat-store";
import { cn } from "@/lib/utils";
 
export const Route = createFileRoute("/_workspace/history")({
  head: () => ({
    meta: [
      { title: "History · JusticeLine AI" },
      { name: "description", content: "Your past legal conversations and drafts." },
    ],
  }),
  component: HistoryPage,
});
 
type FilterType = "all" | "chat" | "draft";
 
interface UnifiedHistoryItem {
  id: string;
  title: string;
  type: "chat" | "draft";
  timestamp: number;
  route: string;
}
 
export function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
 
  useEffect(() => {
    setConversations(loadConversations());
  }, []);
 
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
  };
 
  const handleOpenItem = (item: UnifiedHistoryItem) => {
    if (item.type === "chat") {
      setActiveId(item.id);
      navigate({ to: "/chat" });
    } else {
      navigate({ to: "/saved" });
    }
  };
 
  // Convert real chats and sample drafts into a combined list
  const historyItems: UnifiedHistoryItem[] = useMemo(() => {
    const chats: UnifiedHistoryItem[] = conversations.map((c) => ({
      id: c.id,
      title: c.title || "Untitled Conversation",
      type: "chat",
      timestamp: c.updatedAt || c.createdAt || Date.now(),
      route: "/chat",
    }));
 
    // Placeholder drafts (or loaded from drafts-store if available)
    const mockDrafts: UnifiedHistoryItem[] = [
      {
        id: "draft-1",
        title: "Sale Deed — Kapoor Property Transfer",
        type: "draft",
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        route: "/saved",
      },
      {
        id: "draft-2",
        title: "Legal Notice for Recovery of ₹4.2 Lakh",
        type: "draft",
        timestamp: Date.now() - 1000 * 60 * 60 * 28,
        route: "/saved",
      },
      {
        id: "draft-3",
        title: "Commercial Lease Agreement",
        type: "draft",
        timestamp: Date.now() - 1000 * 60 * 60 * 72,
        route: "/saved",
      },
    ];
 
    return [...chats, ...mockDrafts].sort((a, b) => b.timestamp - a.timestamp);
  }, [conversations]);
 
  // Apply search query and category filter
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "chat" && item.type === "chat") ||
        (selectedFilter === "draft" && item.type === "draft");
 
      return matchesSearch && matchesFilter;
    });
  }, [historyItems, searchQuery, selectedFilter]);
 
  // Group items by relative period (Today, Yesterday, Older)
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: UnifiedHistoryItem[] } = {};
    const now = new Date();
 
    filteredItems.forEach((item) => {
      const d = new Date(item.timestamp);
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();
 
      let groupKey = "Earlier";
      if (isToday) groupKey = "Today";
      else if (isYesterday) groupKey = "Yesterday";
 
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
 
    return groups;
  }, [filteredItems]);
 
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year} • ${time}`;
  };
 
  return (
    <>
      <AppHeader title="History" subtitle="Every conversation and draft, one search away" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations and drafts…"
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm shadow-sm outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </div>
 
          {/* 3 Filters: All, AI Chat, Legal Drafts */}
          <div className="flex items-center gap-2">
            {[
              { id: "all" as const, label: "All" },
              { id: "chat" as const, label: "AI Chat" },
              { id: "draft" as const, label: "Legal Drafts" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                  selectedFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
 
          {/* History Item Lists */}
          <div className="space-y-8 pt-2">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No matching records found.
              </div>
            ) : (
              ["Today", "Yesterday", "Earlier"].map((label) => {
                const items = groupedItems[label];
                if (!items || items.length === 0) return null;
 
                return (
                  <section key={label}>
                    <h3 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {label}
                    </h3>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenItem(item)}
                          className={cn(
                            "group flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40",
                            idx !== 0 && "border-t border-border"
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary">
                              {item.type === "chat" ? (
                                <MessageCircle className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-foreground">
                                {item.title}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="capitalize font-semibold text-[11px]">
                                  {item.type === "chat" ? "AI Chat" : "Legal Draft"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  {formatDateTime(item.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
 
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {item.type === "chat" && (
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteChat(item.id, e)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </main>
    </>
  );
}
 