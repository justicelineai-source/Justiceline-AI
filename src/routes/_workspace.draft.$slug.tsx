import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getDefaultSchema } from "@/lib/document-schemas";
import { setCurrentDraft, saveFormData } from "@/lib/drafts-store";
 
export const Route = createFileRoute("/_workspace/draft/$slug")({
  component: GenericDraftForm,
});
 
function GenericDraftForm() {
  const { slug } = useParams({ from: "/_workspace/draft/$slug" });
  const navigate = useNavigate();
 
  const config = useMemo(() => getDefaultSchema(slug), [slug]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
 
  const currentStep = config.steps[step - 1];
 
  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
 
  const validateStep = (): boolean => {
    const nextErrors: Record<string, string> = {};
    currentStep.fields.forEach((f) => {
      if (!formData[f.name]?.trim()) {
        nextErrors[f.name] = `${f.label} is required`;
      }
    });
 
    if (step === config.steps.length && !declared) {
      nextErrors.declaration = "You must confirm the legal declaration.";
    }
 
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
 
  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(config.steps.length, s + 1));
    }
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
 
    saveFormData(config.slug, formData);
    setCurrentDraft({
      slug: config.slug,
      title: config.title,
      category: config.category,
      data: formData,
      updatedAt: new Date().toISOString(),
    });
 
    navigate({ to: "/draft/preview" });
  };
 
  return (
    <>
      <AppHeader title={config.title} subtitle={`${config.category} · Guided draft`} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Stepper Navigation */}
          <ol className="mb-8 flex flex-wrap items-center gap-y-3">
            {config.steps.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (step > s.id) setStep(s.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary bg-primary/5 text-primary",
                      !done && !active && "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                        done
                          ? "bg-primary-foreground text-primary"
                          : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : s.id}
                    </span>
                    {s.title}
                  </button>
                  {idx < config.steps.length - 1 && (
                    <span className="mx-2 h-px w-6 bg-border sm:w-10" />
                  )}
                </li>
              );
            })}
          </ol>
 
          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
          >
            <div className="border-b border-border bg-secondary/40 px-6 py-4">
              <h2 className="font-serif text-lg font-semibold">
                Section {step}: {currentStep.title} Information
              </h2>
              <p className="text-xs text-muted-foreground">{currentStep.description}</p>
            </div>
 
            <div className="space-y-5 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                {currentStep.fields.map((f) => (
                  <div
                    key={f.name}
                    className={cn("space-y-1.5", f.fullWidth && "sm:col-span-2")}
                  >
                    <Label htmlFor={f.name}>{f.label}</Label>
 
                    {f.type === "select" ? (
                      <select
                        id={f.name}
                        value={formData[f.name] || ""}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:border-primary/40"
                      >
                        <option value="">Select option…</option>
                        {f.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={f.name}
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={formData[f.name] || ""}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                      />
                    )}
 
                    {errors[f.name] && (
                      <p className="text-xs text-destructive">{errors[f.name]}</p>
                    )}
                  </div>
                ))}
              </div>
 
              {/* Upload & Declaration on Final Step */}
              {step === config.steps.length && (
                <div className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <Label>Supporting Documents (Optional)</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-6">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/5 text-primary">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">Drop file or click to upload</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10 MB</p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        Browse
                      </Button>
                    </div>
                  </div>
 
                  <label className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                    <Checkbox
                      checked={declared}
                      onCheckedChange={(c) => {
                        setDeclared(!!c);
                        if (errors.declaration) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.declaration;
                            return next;
                          });
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      I declare that the information provided is accurate and true. I authorize
                      JusticeLine AI to format and draft this legal instrument.
                    </span>
                  </label>
                  {errors.declaration && (
                    <p className="text-xs text-destructive">{errors.declaration}</p>
                  )}
                </div>
              )}
            </div>
 
            {/* Stepper Footer Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
              <Link to="/draft">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
 
                {step < config.steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-brand-gradient text-white hover:opacity-95"
                  >
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-brand-gradient text-white hover:opacity-95">
                    Generate Draft
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
 