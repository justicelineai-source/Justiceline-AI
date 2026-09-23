import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, ChevronLeft, ChevronRight, Save, X, FileEdit, AlertCircle, Edit3, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  parseMarkdownToFormSteps,
  compileFormStepsToMarkdown,
  type FormStep,
} from "@/lib/dynamic-draft-form";
 
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  markdownContent: string;
  onSave: (newTitle: string, newMarkdown: string) => void;
}
 
export function DynamicStepDraftEditor({
  open,
  onOpenChange,
  documentTitle,
  markdownContent,
  onSave,
}: Props) {
  const [title, setTitle] = useState(documentTitle);
  const [rawMarkdown, setRawMarkdown] = useState(markdownContent);
  const [steps, setSteps] = useState<FormStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [activeMode, setActiveMode] = useState<"steps" | "raw">("steps");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
 
  const stepperRef = useRef<HTMLOListElement>(null);
 
  useEffect(() => {
    if (open) {
      setTitle(documentTitle || "Legal Document Draft");
      setRawMarkdown(markdownContent);
      const parsed = parseMarkdownToFormSteps(markdownContent);
      setSteps(parsed);
      setCurrentStepIdx(0);
      setErrorIds(new Set());
    }
  }, [open, documentTitle, markdownContent]);
 
  useEffect(() => {
    if (stepperRef.current && activeMode === "steps") {
      const activeBtn = stepperRef.current.children[currentStepIdx] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentStepIdx, activeMode]);
 
  const handleFieldChange = (fieldId: string, val: string) => {
    setSteps((prev) =>
      prev.map((st, i) => {
        if (i !== currentStepIdx) return st;
        return {
          ...st,
          fields: st.fields.map((f) => (f.id === fieldId ? { ...f, value: val } : f)),
        };
      })
    );
 
    if (errorIds.has(fieldId)) {
      setErrorIds((prev) => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
    }
  };
 
  const validateStep = (stepIdx: number): boolean => {
    if (activeMode === "raw" || !steps[stepIdx]) return true;
    const step = steps[stepIdx];
    const missing = new Set<string>();
 
    step.fields.forEach((f) => {
      if (f.required && !f.value.trim()) {
        missing.add(f.id);
      }
    });
 
    setErrorIds(missing);
    return missing.size === 0;
  };
 
  const goToStep = (idx: number) => {
    if (idx > currentStepIdx && !validateStep(currentStepIdx)) return;
    setSlideDirection(idx > currentStepIdx ? "right" : "left");
    setCurrentStepIdx(idx);
  };
 
  const handleSave = () => {
    if (activeMode === "steps" && !validateStep(currentStepIdx)) return;
 
    let finalMd = "";
    if (activeMode === "raw") {
      finalMd = rawMarkdown;
    } else {
      // In-place compilation: merges changes into rawMarkdown without deleting unchanged content
      finalMd = compileFormStepsToMarkdown(title, steps, rawMarkdown);
    }
 
    onSave(title, finalMd);
    onOpenChange(false);
  };
 
  const currentStep = steps[currentStepIdx];
  const hasStepFields = steps.some((s) => s.fields.length > 0);
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-bold text-foreground">
                Legal Draft Editor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Edit specific variables step-by-step or modify the entire draft directly.
              </DialogDescription>
            </div>
          </div>
 
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
              <button
                type="button"
                onClick={() => setActiveMode("steps")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                  activeMode === "steps"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListOrdered className="h-3.5 w-3.5" /> Step View
              </button>
              <button
                type="button"
                onClick={() => {
                  // Synchronize current step fields into the raw text before switching modes
                  setRawMarkdown(compileFormStepsToMarkdown(title, steps, rawMarkdown));
                  setActiveMode("raw");
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                  activeMode === "raw"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Edit3 className="h-3.5 w-3.5" /> Full Text View
              </button>
            </div>
 
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
 
        {/* Stepper Navigation (Only shown in Step View) */}
        {activeMode === "steps" && (
          <div className="shrink-0 border-b border-border bg-secondary/30 px-6 py-4">
            <div className="mb-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Document / Case Name
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-9 bg-background text-xs font-medium"
                placeholder="e.g. Sale Deed / Legal Notice"
              />
            </div>
 
            <div className="relative overflow-x-auto pb-1 no-scrollbar">
              <ol ref={stepperRef} className="flex min-w-max items-center gap-2">
                {steps.map((s, idx) => {
                  const done = currentStepIdx > idx;
                  const active = currentStepIdx === idx;
                  return (
                    <li key={s.id} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => goToStep(idx)}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                          done && "border-primary bg-primary text-primary-foreground",
                          active &&
                            "scale-105 border-primary bg-primary/15 font-bold text-primary shadow-sm",
                          !done && !active && "border-border text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]",
                            done
                              ? "bg-primary-foreground text-primary font-bold"
                              : active
                              ? "bg-primary text-primary-foreground font-bold"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {done ? <Check className="h-3 w-3" /> : idx + 1}
                        </span>
                        <span>{s.title}</span>
                      </button>
                      {idx < steps.length - 1 && <span className="mx-2 h-px w-6 bg-border" />}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
 
        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeMode === "raw" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Complete Document Markdown
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Edits made here directly update the complete draft.
                </span>
              </div>
              <textarea
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                rows={22}
                className="w-full font-mono text-xs leading-relaxed rounded-lg border border-border bg-background p-4 text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                placeholder="Complete document markdown..."
              />
            </div>
          ) : currentStep && currentStep.fields.length > 0 ? (
            <div
              key={currentStepIdx}
              className={cn(
                "space-y-6 transition-all duration-300 ease-out",
                slideDirection === "right"
                  ? "animate-in fade-in slide-in-from-right-4"
                  : "animate-in fade-in slide-in-from-left-4"
              )}
            >
              {/* Step Description */}
              <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Section {currentStepIdx + 1}: {currentStep.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{currentStep.description}</p>
              </div>
 
              {/* Render Inputs */}
              <div className="space-y-5">
                {currentStep.fields.map((f) => {
                  const hasError = errorIds.has(f.id);
                  return (
                    <div key={f.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground">
                          {f.label}
                          {f.required ? (
                            <span className="ml-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                              * REQUIRED
                            </span>
                          ) : (
                            <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                              (Optional)
                            </span>
                          )}
                        </Label>
                      </div>
 
                      {f.isParagraph ? (
                        <textarea
                          rows={3}
                          value={f.value}
                          onChange={(e) => handleFieldChange(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className={cn(
                            "w-full rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
                            hasError && "border-red-500 focus:ring-red-500/20"
                          )}
                        />
                      ) : (
                        <Input
                          value={f.value}
                          onChange={(e) => handleFieldChange(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className={cn(
                            "h-10 text-xs placeholder:text-muted-foreground/50",
                            hasError && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      )}
 
                      {hasError && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" /> This field is required.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <p className="text-sm">No structured fields detected in this section.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setActiveMode("raw")}
              >
                Switch to Full Text View
              </Button>
            </div>
          )}
        </div>
 
        {/* Stepper Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
          {activeMode === "steps" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStepIdx === 0}
              onClick={() => goToStep(Math.max(0, currentStepIdx - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
 
          <div className="flex items-center gap-2">
            {activeMode === "steps" && currentStepIdx < steps.length - 1 ? (
              <Button
                type="button"
                size="sm"
                className="bg-primary text-primary-foreground shadow-sm hover:opacity-95"
                onClick={() => goToStep(Math.min(steps.length - 1, currentStepIdx + 1))}
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : null}
 
            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground shadow-sm hover:opacity-95"
              onClick={handleSave}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}