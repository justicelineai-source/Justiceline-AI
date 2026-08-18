import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Scale } from "lucide-react";

const AssistantPanel = lazy(() => import("./AssistantPanel"));

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [hover, setHover] = useState(false);

  const openAssistant = () => {
    setInitialized(true);
    setOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <AnimatePresence>
              {hover && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  role="tooltip"
                  className="hidden rounded-xl border border-border/70 bg-background/90 px-3 py-1.5 text-xs font-medium shadow-elegant backdrop-blur-xl sm:block"
                >
                  JusticeLine AI Assistant
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              aria-label="Open JusticeLine AI Assistant"
              title="JusticeLine AI Assistant"
              onClick={openAssistant}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.96 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-white shadow-[0_18px_40px_-12px_rgba(106,27,26,0.75)] ring-1 ring-gold/40"
            >
              <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-gold/15" />
              <span className="pointer-events-none absolute -inset-1 rounded-full bg-gold/10 blur-md" />
              <MessageSquareText className="h-6 w-6" />
              <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full bg-gold-gradient text-gold-foreground shadow-md">
                <Scale className="h-3 w-3" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && initialized && (
          <Suspense fallback={null}>
            <AssistantPanel onClose={() => setOpen(false)} onMinimize={() => setOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
