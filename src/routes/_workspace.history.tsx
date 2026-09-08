import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MessageCircle,
  FileText,
  MoreHorizontal,
  Trash2,
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
 
type FilterType = "all" | "chat" | "draft";
 
interface HistorySearch {
  filter?: FilterType;
}
 
export const Route = createFileRoute("/_workspace/history")({
  validateSearch: (search: Record<string, unknown>): HistorySearch => {
    const filter = search.filter as FilterType;
    return {
      filter: ["all", "chat", "draft"].includes(filter) ? filter : "all",
    };
  },
  head: () => ({
    meta: [
      { title: "History · JusticeLine AI" },
      { name: "description", content: "Your past legal conversations and drafts." },
    ],
  }),
  component: HistoryPage,
});
 
interface UnifiedHistoryItem {
  id: string;
  title: string;
  type: "chat" | "draft";
  modeName?: string;
  timestamp: number;
  route: string;
}
 
const MODE_LABELS: Record<string, string> = {
  quick: "Quick Answer",
  "deep-search": "Deep Search",
  "deep-thinking": "Deep Thinking",
  "deep-research": "Deep Research",
};
 
export function HistoryPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    searchParams.filter || "all"
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [draftsList, setDraftsList] = useState<UnifiedHistoryItem[]>([
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
  ]);
 
  // Sync state if URL query param changes
  useEffect(() => {
    if (searchParams.filter) {
      setSelectedFilter(searchParams.filter);
    }
  }, [searchParams.filter]);
 
  useEffect(() => {
    setConversations(loadConversations());
  }, []);
 
const handleFilterChange = (filter: FilterType) => {
  setSelectedFilter(filter);

  navigate({
    search: { filter },
  });
};
 
  // Universal Delete Handler for both AI Chats and Drafts
  const handleDeleteItem = (item: UnifiedHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "chat") {
      const updated = conversations.filter((c) => c.id !== item.id);
      setConversations(updated);
      saveConversations(updated);
    } else {
      setDraftsList((current) => current.filter((d) => d.id !== item.id));
    }
  };
 
  const handleOpenItem = (item: UnifiedHistoryItem) => {
    if (item.type === "chat") {
      setActiveId(item.id);
      navigate({ to: "/chat" });
    } else {
      navigate({ to: "/saved" });
    }
  };
 
  // Combine real chats with modes and drafts
  const historyItems: UnifiedHistoryItem[] = useMemo(() => {
    const chats: UnifiedHistoryItem[] = conversations.map((c) => {
      const modeKey = (c.mode as string) || "deep-thinking";
      const resolvedMode = MODE_LABELS[modeKey] || modeKey;
 
      return {
        id: c.id,
        title: c.title || "Untitled Conversation",
        type: "chat",
        modeName: resolvedMode,
        timestamp: c.updatedAt || Date.now(),
        route: "/chat",
      };
    });
 
    return [...chats, ...draftsList].sort((a, b) => b.timestamp - a.timestamp);
  }, [conversations, draftsList]);
 
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
 
  // Formats date heading: "Tuesday, 1 September 2026"
  const formatDateHeader = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  };
 
  // Formats time: "16:49" (24-Hour)
  const formatTimeOnly = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  };
 
  const groupedByDate = useMemo(() => {
    const groups: { [dateKey: string]: { dateText: string; items: UnifiedHistoryItem[] } } = {};
 
    filteredItems.forEach((item) => {
      const d = new Date(item.timestamp);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
 
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateText: formatDateHeader(item.timestamp),
          items: [],
        };
      }
      groups[dateKey].items.push(item);
    });
 
    return Object.values(groups);
  }, [filteredItems]);
 
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
                onClick={() => handleFilterChange(f.id)}
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
 
          {/* Grouped History List */}
          <div className="space-y-7 pt-2">
            {groupedByDate.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No matching history found.
              </div>
            ) : (
              groupedByDate.map((group) => (
                <section key={group.dateText}>
                  {/* Date Header */}
                  <h3 className="mb-3 px-1 font-serif text-sm font-semibold tracking-tight text-foreground sm:text-base">
                    {group.dateText}
                  </h3>
 
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {group.items.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenItem(item)}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40",
                          idx !== 0 && "border-t border-border"
                        )}
                      >
                        {/* Title and Category/Search Mode */}
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
                            <div className="text-xs text-muted-foreground">
                              {item.type === "chat" ? (
                                <span>
                                  AI Chat
                                  {item.modeName && ` · ${item.modeName}`}
                                </span>
                              ) : (
                                <span>Legal Draft</span>
                              )}
                            </div>
                          </div>
                        </div>
 
                        {/* Time and Dropdown Options */}
                        <div className="flex items-center gap-4">
                          {/* Larger Time Font */}
                          <span className="font-mono text-mg font-medium tracking-normal text-muted-foreground">
                            {formatTimeOnly(item.timestamp)}
                          </span>
 
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteItem(item, e)}
                                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}