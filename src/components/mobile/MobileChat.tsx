import { useState } from "react";
import { MessageCircle, Plus, Trash2, PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open conversation history"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent lg:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </SheetTrigger>
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
          {(["Today", "Yesterday", "Last week", "Earlier"] as const).map((group) => {
            const rows = conversations.filter((c) => timeBucket(c.updatedAt) === group);
            if (rows.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {rows.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "flex items-center gap-1 rounded-md transition-colors",
                        activeId === c.id
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60",
                      )}
                    >
                      <button
                        onClick={() => {
                          onSelect(c.id);
                          setOpen(false);
                        }}
                        className="flex min-h-[44px] min-w-0 flex-1 items-start gap-2 px-2 py-2.5 text-left text-xs"
                      >
                        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2 min-w-0 break-words leading-snug">
                          {c.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete conversation"
                        onClick={() => onDelete(c.id)}
                        className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
