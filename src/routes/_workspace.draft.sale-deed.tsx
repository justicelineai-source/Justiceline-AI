import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  UserCheck,
  Home,
  Wallet,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_workspace/draft/sale-deed")({
  head: () => ({
    meta: [
      { title: "Sale Deed · JusticeLine AI" },
      { name: "description", content: "Generate a professional Sale Deed with a guided form." },
      { property: "og:title", content: "Sale Deed Draft · JusticeLine AI" },
      { property: "og:description", content: "Guided Sale Deed generation." },
    ],
  }),
  component: SaleDeedForm,
});

const schema = z.object({
  sellerName: z.string().min(2, "Required"),
  sellerPhone: z.string().min(7),
  sellerEmail: z.string().email(),
  sellerAddress: z.string().min(5),
  buyerName: z.string().min(2),
  buyerPhone: z.string().min(7),
  buyerEmail: z.string().email(),
  buyerAddress: z.string().min(5),
  propertyType: z.string().min(1),
  surveyNumber: z.string().min(1),
  propertyAddress: z.string().min(5),
  village: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  propertyArea: z.string().min(1),
  saleAmount: z.string().min(1),
  advanceAmount: z.string().min(1),
  paymentMethod: z.string().min(1),
  dateOfSale: z.string().min(1),
  subRegistrar: z.string().min(1),
  registrationDate: z.string().min(1),
  declaration: z.literal(true, { message: "You must confirm the declaration" }),
});
type FormValues = z.infer<typeof schema>;

const steps = [
  { id: 1, title: "Seller", icon: User },
  { id: 2, title: "Buyer", icon: UserCheck },
  { id: 3, title: "Property", icon: Home },
  { id: 4, title: "Sale", icon: Wallet },
  { id: 5, title: "Registration", icon: FileCheck },
];

function SaleDeedForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [defaults] = useState<Partial<FormValues>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("justiceline.form.sale-deed");
      return raw ? (JSON.parse(raw) as Partial<FormValues>) : {};
    } catch { return {}; }
  });
  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: defaults,
  });


  const fieldsByStep: Record<number, (keyof FormValues)[]> = {
    1: ["sellerName", "sellerPhone", "sellerEmail", "sellerAddress"],
    2: ["buyerName", "buyerPhone", "buyerEmail", "buyerAddress"],
    3: ["propertyType", "surveyNumber", "propertyAddress", "village", "district", "state", "pincode", "propertyArea"],
    4: ["saleAmount", "advanceAmount", "paymentMethod", "dateOfSale"],
    5: ["subRegistrar", "registrationDate", "declaration"],
  };

  const next = async () => {
    const ok = await trigger(fieldsByStep[step]);
    if (ok) setStep((s) => Math.min(5, s + 1));
  };

  const onSubmit = (values: FormValues) => {
    import("@/lib/drafts-store").then(({ setCurrentDraft, saveFormData }) => {
      saveFormData("sale-deed", values as unknown as Record<string, string>);
      setCurrentDraft({
        slug: "sale-deed",
        title: "Sale Deed",
        category: "Property Documents",
        data: values as unknown as Record<string, string>,
        updatedAt: new Date().toISOString(),
      });
      navigate({ to: "/draft/preview" });
    });
  };

  return (
    <>
      <AppHeader title="Sale Deed" subtitle="Property Documents · Guided draft" />
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
                    <span className={cn(
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                      done ? "bg-primary-foreground text-primary" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                    )}>
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
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
          >
            <div className="border-b border-border bg-secondary/40 px-6 py-4">
              <h2 className="font-serif text-lg font-semibold">Section {step}: {steps[step - 1].title} Information</h2>
              <p className="text-xs text-muted-foreground">All fields are required. Data is encrypted end-to-end.</p>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Seller Full Name" name="sellerName" register={register} errors={errors} placeholder="Rajesh Kumar Sharma" />
                  <Field label="Phone Number" name="sellerPhone" register={register} errors={errors} placeholder="+91 98765 43210" />
                  <Field label="Email Address" name="sellerEmail" register={register} errors={errors} type="email" placeholder="rajesh@example.com" />
                  <Field className="sm:col-span-2" label="Full Address" name="sellerAddress" register={register} errors={errors} placeholder="House number, street, locality, city, state, pincode" />
                </div>
              )}
              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Buyer Full Name" name="buyerName" register={register} errors={errors} placeholder="Priya Mehta" />
                  <Field label="Phone Number" name="buyerPhone" register={register} errors={errors} placeholder="+91 98765 43210" />
                  <Field label="Email Address" name="buyerEmail" register={register} errors={errors} type="email" placeholder="priya@example.com" />
                  <Field className="sm:col-span-2" label="Full Address" name="buyerAddress" register={register} errors={errors} placeholder="House number, street, locality, city, state, pincode" />
                </div>
              )}
              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField label="Property Type" name="propertyType" register={register} errors={errors} options={["Residential Plot", "Agricultural Land", "Apartment / Flat", "Commercial Property", "Independent House"]} />
                  <Field label="Survey / Plot Number" name="surveyNumber" register={register} errors={errors} placeholder="Survey No. 142/2A" />
                  <Field className="sm:col-span-2" label="Property Address" name="propertyAddress" register={register} errors={errors} placeholder="Plot address including landmarks" />
                  <Field label="Village / Locality" name="village" register={register} errors={errors} placeholder="Jubilee Hills" />
                  <Field label="District" name="district" register={register} errors={errors} placeholder="Hyderabad" />
                  <Field label="State" name="state" register={register} errors={errors} placeholder="Telangana" />
                  <Field label="Pincode" name="pincode" register={register} errors={errors} placeholder="500033" />
                  <Field label="Property Area (sq. ft.)" name="propertyArea" register={register} errors={errors} placeholder="2400" />
                </div>
              )}
              {step === 4 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Total Sale Amount (₹)" name="saleAmount" register={register} errors={errors} placeholder="1,25,00,000" />
                  <Field label="Advance Paid (₹)" name="advanceAmount" register={register} errors={errors} placeholder="25,00,000" />
                  <SelectField label="Payment Method" name="paymentMethod" register={register} errors={errors} options={["Bank Transfer (NEFT/RTGS)", "Cheque", "Demand Draft", "Combination"]} />
                  <Field label="Date of Sale" name="dateOfSale" register={register} errors={errors} type="date" />
                </div>
              )}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Sub-Registrar Office" name="subRegistrar" register={register} errors={errors} placeholder="SRO Ranga Reddy" />
                    <Field label="Registration Date" name="registrationDate" register={register} errors={errors} type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Upload Previous Sale Deed (optional)</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-6">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/5 text-primary">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">Drop file or click to upload</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10 MB</p>
                      </div>
                      <Button type="button" variant="outline" size="sm">Browse</Button>
                    </div>
                  </div>
                  <label className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                    <Checkbox {...register("declaration")} className="mt-0.5" />
                    <span className="text-muted-foreground">
                      I declare that the above information is true to the best of my knowledge, and I authorise
                      JusticeLine AI to prepare a draft Sale Deed based on the details provided. This draft is
                      subject to legal review before registration.
                    </span>
                  </label>
                  {errors.declaration && (
                    <p className="text-xs text-destructive">{errors.declaration.message as string}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
              <Link to="/draft">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
                {step < 5 ? (
                  <Button type="button" onClick={next} className="bg-brand-gradient text-white hover:opacity-95">
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

function Field({
  label, name, register, errors, type = "text", placeholder, className,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
      {errors[name] && <p className="text-xs text-destructive">{(errors[name] as { message?: string })?.message}</p>}
    </div>
  );
}

function SelectField({
  label, name, register, errors, options,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        {...register(name)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:border-primary/40"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[name] && <p className="text-xs text-destructive">{(errors[name] as { message?: string })?.message}</p>}
    </div>
  );
}
