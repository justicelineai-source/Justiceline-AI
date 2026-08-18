import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  User,
  Users,
  Info,
  FileCheck,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Map of template slug → { title, category, sections }
// Sale Deed has its own dedicated route (_workspace.draft.sale-deed.tsx) and
// takes precedence; every other template resolves here as a placeholder form
// with the same guided, sectioned layout as Sale Deed.
type TemplateDef = { title: string; category: string; formName: string };

const TEMPLATES: Record<string, TemplateDef> = {
  // Property
  "gift-deed": { title: "Gift Deed", category: "Property Documents", formName: "Gift Deed Form" },
  "lease-deed": { title: "Lease Deed", category: "Property Documents", formName: "Lease Agreement Form" },
  "rental-agreement": { title: "Rental Agreement", category: "Property Documents", formName: "Rental Agreement Form" },
  "mortgage-deed": { title: "Mortgage Deed", category: "Property Documents", formName: "Mortgage Deed Form" },
  "partition-deed": { title: "Partition Deed", category: "Property Documents", formName: "Partition Deed Form" },
  "relinquishment-deed": { title: "Relinquishment Deed", category: "Property Documents", formName: "Relinquishment Deed Form" },
  "settlement-deed": { title: "Settlement Deed", category: "Property Documents", formName: "Settlement Deed Form" },
  "exchange-deed": { title: "Exchange Deed", category: "Property Documents", formName: "Exchange Deed Form" },
  "rectification-deed": { title: "Rectification Deed", category: "Property Documents", formName: "Rectification Deed Form" },
  "release-deed": { title: "Release Deed", category: "Property Documents", formName: "Release Deed Form" },
  "conveyance-deed": { title: "Conveyance Deed", category: "Property Documents", formName: "Conveyance Deed Form" },
  // Court
  affidavit: { title: "Affidavit", category: "Court Documents", formName: "Affidavit Form" },
  "legal-notice": { title: "Legal Notice", category: "Court Documents", formName: "Legal Notice Form" },
  petition: { title: "Petition", category: "Court Documents", formName: "Petition Form" },
  appeal: { title: "Appeal", category: "Court Documents", formName: "Appeal Form" },
  "written-statement": { title: "Written Statement", category: "Court Documents", formName: "Written Statement Form" },
  "counter-affidavit": { title: "Counter Affidavit", category: "Court Documents", formName: "Counter Affidavit Form" },
  "caveat-petition": { title: "Caveat Petition", category: "Court Documents", formName: "Caveat Petition Form" },
  "bail-application": { title: "Bail Application", category: "Court Documents", formName: "Bail Application Form" },
  "writ-petition": { title: "Writ Petition", category: "Court Documents", formName: "Writ Petition Form" },
  "revision-petition": { title: "Revision Petition", category: "Court Documents", formName: "Revision Petition Form" },
  "review-petition": { title: "Review Petition", category: "Court Documents", formName: "Review Petition Form" },
  memo: { title: "Memo", category: "Court Documents", formName: "Memo Form" },
  vakalatnama: { title: "Vakalatnama", category: "Court Documents", formName: "Vakalatnama Form" },
  // Business
  "employment-agreement": { title: "Employment Agreement", category: "Business Agreements", formName: "Employment Agreement Form" },
  "partnership-agreement": { title: "Partnership Agreement", category: "Business Agreements", formName: "Partnership Agreement Form" },
  nda: { title: "Non-Disclosure Agreement", category: "Business Agreements", formName: "NDA Form" },
  "service-agreement": { title: "Service Agreement", category: "Business Agreements", formName: "Service Agreement Form" },
  "vendor-agreement": { title: "Vendor Agreement", category: "Business Agreements", formName: "Vendor Agreement Form" },
  "consultancy-agreement": { title: "Consultancy Agreement", category: "Business Agreements", formName: "Consultancy Agreement Form" },
  "franchise-agreement": { title: "Franchise Agreement", category: "Business Agreements", formName: "Franchise Agreement Form" },
  mou: { title: "Memorandum of Understanding", category: "Business Agreements", formName: "MoU Form" },
  "joint-venture-agreement": { title: "Joint Venture Agreement", category: "Business Agreements", formName: "Joint Venture Form" },
  "shareholders-agreement": { title: "Shareholders Agreement", category: "Business Agreements", formName: "Shareholders Agreement Form" },
  "software-development-agreement": { title: "Software Development Agreement", category: "Business Agreements", formName: "Software Development Agreement Form" },
  // Personal
  will: { title: "Will", category: "Personal Documents", formName: "Will Form" },
  "power-of-attorney": { title: "Power of Attorney", category: "Personal Documents", formName: "Power of Attorney Form" },
  declaration: { title: "Declaration", category: "Personal Documents", formName: "Declaration Form" },
  "name-change-affidavit": { title: "Name Change Affidavit", category: "Personal Documents", formName: "Name Change Form" },
  "marriage-affidavit": { title: "Marriage Affidavit", category: "Personal Documents", formName: "Marriage Affidavit Form" },
  "divorce-settlement-agreement": { title: "Divorce Settlement Agreement", category: "Personal Documents", formName: "Divorce Settlement Form" },
  "adoption-deed": { title: "Adoption Deed", category: "Personal Documents", formName: "Adoption Deed Form" },
  "guardianship-declaration": { title: "Guardianship Declaration", category: "Personal Documents", formName: "Guardianship Form" },
  // Family
  "marriage-agreement": { title: "Marriage Agreement", category: "Family Documents", formName: "Marriage Agreement Form" },
  "divorce-petition": { title: "Divorce Petition", category: "Family Documents", formName: "Divorce Petition Form" },
  "child-custody-petition": { title: "Child Custody Petition", category: "Family Documents", formName: "Child Custody Form" },
  "maintenance-petition": { title: "Maintenance Petition", category: "Family Documents", formName: "Maintenance Petition Form" },
  "succession-certificate": { title: "Succession Certificate Application", category: "Family Documents", formName: "Succession Certificate Form" },
  "family-settlement-deed": { title: "Family Settlement Deed", category: "Family Documents", formName: "Family Settlement Form" },
  // Company
  "board-resolution": { title: "Board Resolution", category: "Company Documents", formName: "Board Resolution Form" },
  moa: { title: "Memorandum of Association", category: "Company Documents", formName: "MOA Form" },
  aoa: { title: "Articles of Association", category: "Company Documents", formName: "AOA Form" },
  "offer-letter": { title: "Employment Offer Letter", category: "Company Documents", formName: "Offer Letter Form" },
  "appointment-letter": { title: "Appointment Letter", category: "Company Documents", formName: "Appointment Letter Form" },
  "resignation-acceptance": { title: "Resignation Acceptance Letter", category: "Company Documents", formName: "Resignation Acceptance Form" },
  "experience-certificate": { title: "Experience Certificate", category: "Company Documents", formName: "Experience Certificate Form" },
};

export const Route = createFileRoute("/_workspace/draft/$slug")({
  head: ({ params }) => {
    const t = TEMPLATES[params.slug];
    const title = t ? `${t.title} · JusticeLine AI` : "Legal Draft · JusticeLine AI";
    return {
      meta: [
        { title },
        { name: "description", content: t ? `Generate a professional ${t.title} with a guided form.` : "Guided legal draft." },
        { property: "og:title", content: title },
        { property: "og:description", content: t ? `${t.formName} — guided draft generation.` : "Guided legal draft." },
      ],
    };
  },
  component: PlaceholderDraftForm,
  notFoundComponent: NotFoundTemplate,
});

const steps = [
  { id: 1, title: "Parties", icon: User },
  { id: 2, title: "Details", icon: Users },
  { id: 3, title: "Terms", icon: Info },
  { id: 4, title: "Review", icon: FileCheck },
];

function PlaceholderDraftForm() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const tpl = TEMPLATES[slug];
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  if (!tpl) return <NotFoundTemplate />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (typeof v === "string") data[k] = v; });
    import("@/lib/drafts-store").then(({ setCurrentDraft, saveFormData }) => {
      saveFormData(slug, data);
      setCurrentDraft({
        slug,
        title: tpl.title,
        category: tpl.category,
        data,
        updatedAt: new Date().toISOString(),
      });
      navigate({ to: "/draft/preview" });
    });
  };


  return (
    <>
      <AppHeader title={tpl.title} subtitle={`${tpl.category} · Guided draft`} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Stepper */}
          <ol className="mb-8 flex flex-wrap items-center gap-y-3">
            {steps.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary bg-primary/5 text-primary",
                      !done && !active && "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                        done
                          ? "bg-primary-foreground text-primary"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : s.id}
                    </span>
                    {s.title}
                  </button>
                  {idx < steps.length - 1 && <span className="mx-2 h-px w-6 bg-border sm:w-10" />}
                </li>
              );
            })}
          </ol>

          <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
          >
            <div className="border-b border-border bg-secondary/40 px-6 py-4">
              <h2 className="font-serif text-lg font-semibold">
                Section {step}: {steps[step - 1].title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tpl.formName} · Detailed fields coming soon. Placeholder inputs shown below.
              </p>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <PlaceField name="sellerName" label="First Party — Full Name" placeholder="Full legal name" />
                  <PlaceField name="sellerPhone" label="First Party — Contact" placeholder="Phone / Email" />
                  <PlaceField name="buyerName" label="Second Party — Full Name" placeholder="Full legal name" />
                  <PlaceField name="buyerPhone" label="Second Party — Contact" placeholder="Phone / Email" />
                  <PlaceField
                    className="sm:col-span-2"
                    name="sellerAddress"
                    label="First Party Address"
                    placeholder="Full address"
                  />
                  <PlaceField
                    className="sm:col-span-2"
                    name="buyerAddress"
                    label="Second Party Address"
                    placeholder="Full address"
                  />
                </div>
              )}
              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <PlaceField name="propertyType" label="Subject / Purpose" placeholder={`Purpose of ${tpl.title}`} />
                  <PlaceField name="dateOfSale" label="Effective Date" type="date" />
                  <PlaceField
                    className="sm:col-span-2"
                    name="propertyAddress"
                    label="Description"
                    placeholder={`Brief description related to ${tpl.title}`}
                  />
                  <PlaceField name="district" label="Jurisdiction (City / District)" placeholder="e.g. Mumbai" />
                  <PlaceField name="state" label="State" placeholder="e.g. Maharashtra" />
                </div>
              )}
              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <PlaceField
                    className="sm:col-span-2"
                    name="keyTerms"
                    label="Key Terms & Conditions"
                    placeholder="Enter the primary terms"
                  />
                  <PlaceField name="saleAmount" label="Consideration / Value (₹)" placeholder="0" />
                  <PlaceField name="duration" label="Duration / Validity" placeholder="e.g. 11 months" />
                  <PlaceField
                    className="sm:col-span-2"
                    name="additionalClauses"
                    label="Additional Clauses"
                    placeholder="Any special clauses to include"
                  />
                </div>
              )}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Review {tpl.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Confirm the details entered above. JusticeLine AI will assemble a
                        professionally formatted draft ready for legal review.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      I declare that the information provided is true to the best of my knowledge
                      and authorise JusticeLine AI to generate this {tpl.title} draft, subject to
                      legal review before use.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
              <Link to="/draft">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
                {step < steps.length ? (
                  <Button
                    type="button"
                    onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
                    className="bg-brand-gradient text-white hover:opacity-95"
                  >
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!agreed}
                    className="bg-brand-gradient text-white hover:opacity-95 disabled:opacity-50"
                  >
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

function PlaceField({
  label,
  name,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} />
    </div>
  );
}

function NotFoundTemplate() {
  return (
    <>
      <AppHeader title="Template not found" subtitle="Legal Draft" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
          <h2 className="font-serif text-xl font-semibold">This template is not available</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested draft template does not exist yet.
          </p>
          <Link to="/draft">
            <Button className="mt-6 bg-brand-gradient text-white hover:opacity-95">
              Back to Templates
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
