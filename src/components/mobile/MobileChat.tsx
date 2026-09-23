import { useMemo, useState } from "react";
import { MessageCircle, Plus, Trash2, PanelLeft, History, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { timeBucket, type Conversation } from "@/lib/chat-store";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
};

const GROUPS = ["Today", "Yesterday", "Last week", "Earlier"] as const;

function ConversationRow({
  conversation,
  active,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60",
      )}
    >
      <button
        onClick={onSelect}
        className="flex min-h-[44px] min-w-0 flex-1 items-start gap-2 px-2 py-2.5 text-left text-xs"
      >
        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="line-clamp-2 min-w-0 break-words leading-snug">{conversation.title}</span>
      </button>
      <button
        type="button"
        aria-label="Delete conversation"
        onClick={onDelete}
        className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-md text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Conversation history drawer for mobile/tablet chat. Presentation only —
 * all conversation state stays in the chat route.
 */
export function MobileChatHistoryDrawer({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: Props & { open?: boolean; onOpenChange?: (o: boolean) => void; hideTrigger?: boolean }) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open conversation history"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent lg:hidden"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </SheetTrigger>
      )}
      <SheetContent side="left" className="flex w-[86vw] max-w-[340px] flex-col gap-0 p-0">
        <SheetTitle className="sr-only">Conversation history</SheetTitle>
        <div className="shrink-0 border-b border-border p-4">
          <Button
            onClick={() => {
              onNewChat();
              setOpen(false);
            }}
            className="min-h-[44px] w-full justify-start gap-2 bg-brand-gradient text-white hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          {GROUPS.map((group) => {
            const rows = conversations.filter((c) => timeBucket(c.updatedAt) === group);
            if (rows.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {rows.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      active={activeId === c.id}
                      onSelect={() => {
                        onSelect(c.id);
                        setOpen(false);
                      }}
                      onDelete={() => onDelete(c.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No conversations yet. Start a new chat.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Search drawer over the existing conversation store. */
function ConversationSearchDrawer({
  conversations,
  activeId,
  onSelect,
  onDelete,
  open,
  onOpenChange,
}: Omit<Props, "onNewChat"> & { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.messages.some((m) => m.content.toLowerCase().includes(term)),
    );
  }, [conversations, q]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[86vw] max-w-[340px] flex-col gap-0 p-0">
        <SheetTitle className="sr-only">Search conversations</SheetTitle>
        <div className="shrink-0 border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations…"
              className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
          {results.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              active={activeId === c.id}
              onSelect={() => {
                onSelect(c.id);
                onOpenChange(false);
              }}
              onDelete={() => onDelete(c.id)}
            />
          ))}
          {results.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No conversations match “{q}”.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Compact "+" quick-actions control rendered inside the chat page header:
 * New Chat, History, Search — all wired to the chat route's conversation store.
 */
export function MobileChatQuickActions(props: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Chat quick actions"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="w-44">
          <DropdownMenuItem onSelect={() => props.onNewChat()}>
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTimeout(() => setHistoryOpen(true), 0)}>
            <History className="mr-2 h-4 w-4" /> History
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTimeout(() => setSearchOpen(true), 0)}>
            <Search className="mr-2 h-4 w-4" /> Search
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MobileChatHistoryDrawer
        {...props}
        hideTrigger
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
      <ConversationSearchDrawer
        conversations={props.conversations}
        activeId={props.activeId}
        onSelect={props.onSelect}
        onDelete={props.onDelete}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
}
