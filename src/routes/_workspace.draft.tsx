import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Gavel,
  Users,
  ScrollText,
  Users2,
  Briefcase,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_workspace/draft")({
  head: () => ({
    meta: [
      { title: "Legal Draft · JusticeLine AI" },
      { name: "description", content: "Generate professional legal documents with guided forms." },
      { property: "og:title", content: "Legal Draft Generator · JusticeLine AI" },
      { property: "og:description", content: "Sale Deeds, Affidavits, Notices, Wills and more." },
    ],
  }),
  component: DraftLayout,
});

type TemplateItem = { name: string; to: string; featured?: boolean };
type Category = {
  icon: typeof Building2;
  title: string;
  items: TemplateItem[];
};

const categories: Category[] = [
  {
    icon: Building2,
    title: "Property Documents",
    items: [
      { name: "Sale Deed", to: "/draft/sale-deed", featured: true },
      { name: "Gift Deed", to: "/draft/gift-deed" },
      { name: "Lease Deed", to: "/draft/lease-deed" },
      { name: "Rental Agreement", to: "/draft/rental-agreement" },
      { name: "Mortgage Deed", to: "/draft/mortgage-deed" },
      { name: "Partition Deed", to: "/draft/partition-deed" },
      { name: "Relinquishment Deed", to: "/draft/relinquishment-deed" },
      { name: "Settlement Deed", to: "/draft/settlement-deed" },
      { name: "Exchange Deed", to: "/draft/exchange-deed" },
      { name: "Rectification Deed", to: "/draft/rectification-deed" },
      { name: "Release Deed", to: "/draft/release-deed" },
      { name: "Conveyance Deed", to: "/draft/conveyance-deed" },
    ],
  },
  {
    icon: Gavel,
    title: "Court Documents",
    items: [
      { name: "Affidavit", to: "/draft/affidavit" },
      { name: "Legal Notice", to: "/draft/legal-notice" },
      { name: "Petition", to: "/draft/petition" },
      { name: "Appeal", to: "/draft/appeal" },
      { name: "Written Statement", to: "/draft/written-statement" },
      { name: "Counter Affidavit", to: "/draft/counter-affidavit" },
      { name: "Caveat Petition", to: "/draft/caveat-petition" },
      { name: "Bail Application", to: "/draft/bail-application" },
      { name: "Writ Petition", to: "/draft/writ-petition" },
      { name: "Revision Petition", to: "/draft/revision-petition" },
      { name: "Review Petition", to: "/draft/review-petition" },
      { name: "Memo", to: "/draft/memo" },
      { name: "Vakalatnama", to: "/draft/vakalatnama" },
    ],
  },
  {
    icon: Users,
    title: "Business Agreements",
    items: [
      { name: "Employment Agreement", to: "/draft/employment-agreement" },
      { name: "Partnership Agreement", to: "/draft/partnership-agreement" },
      { name: "Non-Disclosure Agreement (NDA)", to: "/draft/nda" },
      { name: "Service Agreement", to: "/draft/service-agreement" },
      { name: "Vendor Agreement", to: "/draft/vendor-agreement" },
      { name: "Consultancy Agreement", to: "/draft/consultancy-agreement" },
      { name: "Franchise Agreement", to: "/draft/franchise-agreement" },
      { name: "Memorandum of Understanding (MoU)", to: "/draft/mou" },
      { name: "Joint Venture Agreement", to: "/draft/joint-venture-agreement" },
      { name: "Shareholders Agreement", to: "/draft/shareholders-agreement" },
      { name: "Software Development Agreement", to: "/draft/software-development-agreement" },
    ],
  },
  {
    icon: ScrollText,
    title: "Personal Documents",
    items: [
      { name: "Will", to: "/draft/will" },
      { name: "Power of Attorney", to: "/draft/power-of-attorney" },
      { name: "Declaration", to: "/draft/declaration" },
      { name: "Name Change Affidavit", to: "/draft/name-change-affidavit" },
      { name: "Marriage Affidavit", to: "/draft/marriage-affidavit" },
      { name: "Divorce Settlement Agreement", to: "/draft/divorce-settlement-agreement" },
      { name: "Adoption Deed", to: "/draft/adoption-deed" },
      { name: "Guardianship Declaration", to: "/draft/guardianship-declaration" },
    ],
  },
  {
    icon: Users2,
    title: "Family Documents",
    items: [
      { name: "Marriage Agreement", to: "/draft/marriage-agreement" },
      { name: "Divorce Petition", to: "/draft/divorce-petition" },
      { name: "Child Custody Petition", to: "/draft/child-custody-petition" },
      { name: "Maintenance Petition", to: "/draft/maintenance-petition" },
      { name: "Succession Certificate Application", to: "/draft/succession-certificate" },
      { name: "Family Settlement Deed", to: "/draft/family-settlement-deed" },
    ],
  },
  {
    icon: Briefcase,
    title: "Company Documents",
    items: [
      { name: "Board Resolution", to: "/draft/board-resolution" },
      { name: "Memorandum of Association (MOA)", to: "/draft/moa" },
      { name: "Articles of Association (AOA)", to: "/draft/aoa" },
      { name: "Employment Offer Letter", to: "/draft/offer-letter" },
      { name: "Appointment Letter", to: "/draft/appointment-letter" },
      { name: "Resignation Acceptance Letter", to: "/draft/resignation-acceptance" },
      { name: "Experience Certificate", to: "/draft/experience-certificate" },
    ],
  },
];

function DraftLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/draft") return <Outlet />;
  return <DraftIndex />;
}

function TemplateRow({ i }: { i: TemplateItem }) {
  return (
    <Link
      to={i.to}
      className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-primary/15 hover:bg-secondary/50"
    >
      <span className="flex items-center gap-2 font-medium text-foreground">
        {i.name}
        {i.featured && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6408]">
            Popular
          </span>
        )}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function DraftIndex() {
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<Category | null>(null);

  const filtered = categories.map((c) => ({
    ...c,
    filteredItems: c.items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
  }));

  return (
    <>
      <AppHeader title="Create Legal Draft" subtitle="Choose a template to begin drafting" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-premium sm:p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-gold">
                  <Sparkles className="h-3.5 w-3.5" /> AI-assisted drafting
                </div>
                <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                  Court-ready documents in minutes
                </h2>
                <p className="mt-1.5 max-w-lg text-sm text-white/70">
                  Answer a few guided questions and JusticeLine assembles a professionally
                  formatted draft, ready to review and file.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates…"
                  className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur focus:border-gold/50"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((c) => {
              const isSearching = query.trim().length > 0;
              const visible = isSearching ? c.filteredItems : c.items.slice(0, 3);
              const totalCount = c.items.length;
              return (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold">{c.title}</h3>
                      <p className="text-xs text-muted-foreground">{totalCount} templates available</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {visible.map((i) => (
                      <li key={i.name}>
                        <TemplateRow i={i} />
                      </li>
                    ))}
                    {visible.length === 0 && (
                      <li className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                        No matches
                      </li>
                    )}
                  </ul>
                  {!isSearching && totalCount > 3 && (
                    <button
                      type="button"
                      onClick={() => setOpenCategory(c)}
                      className="group mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                    >
                      <span>View All ({totalCount} Templates)</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Dialog open={!!openCategory} onOpenChange={(o) => !o && setOpenCategory(null)}>
        <DialogContent className="max-w-2xl">
          {openCategory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                    <openCategory.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <DialogTitle className="font-serif text-xl">{openCategory.title}</DialogTitle>
                    <DialogDescription>
                      {openCategory.items.length} templates available
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <ul className="mt-2 grid max-h-[60vh] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {openCategory.items.map((i) => (
                  <li key={i.name} onClick={() => setOpenCategory(null)}>
                    <TemplateRow i={i} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
