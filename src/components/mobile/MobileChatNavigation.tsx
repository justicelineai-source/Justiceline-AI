import { Plus, Search, MessageCircle } from "lucide-react";

type MobileChatNavigationProps = {
  onNewChat?: () => void;
};

export function MobileChatNavigation({
  onNewChat,
}: MobileChatNavigationProps) {
  return (
    <div className="flex h-full flex-col">
      
      {/* New Chat */}
      <button
        type="button"
        onClick={onNewChat}
        className="flex min-h-[48px] w-full items-center gap-3 rounded-lg bg-brand-gradient px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus className="h-5 w-5" />
        New Chat
      </button>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          placeholder="Search conversations"
          className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none"
        />
      </div>

      {/* Conversations */}
      <div className="mt-6 flex-1 overflow-y-auto">
        
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Today
        </p>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-muted">
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">What is Section 302 IPC?</span>
        </button>

        <p className="mb-2 mt-5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Yesterday
        </p>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-muted">
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">Legal guidelines overview</span>
        </button>

        <p className="mb-2 mt-5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Last Week
        </p>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-muted">
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">Recent Supreme Court cases</span>
        </button>

      </div>
    </div>
  );
}