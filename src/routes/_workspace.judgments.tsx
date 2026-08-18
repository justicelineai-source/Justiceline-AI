import { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  List,
  Printer,
  X,
} from "lucide-react";
 
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";


type JudgmentRow = {
  id?: number;
  Keycode?: number | null;
  COURT?: string | null;
  Judges?: string | null;
  CaseNo?: string | null;
  Appellant?: string | null;
  Respondent?: string | null;
  Headnote?: string | null;
  HNote?: string | null;
  Judgement?: string | null;
  Actreferred?: string | null;
  Date?: string | null;
  Bench?: number | null;
  Result?: string | null;
  [key: string]: string | number | null | undefined;
};
 
const PAGE_SIZE = 10;
 
function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
 
function summary(text: string | null | undefined, maxWords = 25) {
  if (!text) return "No judgment available.";
 
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
 
  // Remove unwanted elements that contain CSS/JavaScript/metadata
  doc.querySelectorAll("style, script, noscript, head, title").forEach((el) => {
    el.remove();
  });
 
  // Get only visible text
  const cleanText = (doc.body?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
 
  if (!cleanText) {
    return "No judgment preview available.";
  }
 
  const words = cleanText.split(" ").filter(Boolean);
 
  return words.length <= maxWords
    ? cleanText
    : `${words.slice(0, maxWords).join(" ")}…`;
}
 
export const Route = createFileRoute("/_workspace/judgments")({
  head: () => ({
    meta: [
      { title: "Judgments · JusticeLine AI" },
      { name: "description", content: "Search and review legal judgments from the JusticeLine Supabase database." },
      { property: "og:title", content: "Judgments · JusticeLine AI" },
      { property: "og:description", content: "Search and review legal judgments from the JusticeLine Supabase database." },
    ],
  }),
  component: JudgmentsPage,
});
 
function JudgmentsPage() {
  const [search, setSearch] = useState("");
  const [court, setCourt] = useState("");
  const [year, setYear] = useState("");
  const [judge, setJudge] = useState("");
  const [actOrSection, setActOrSection] = useState("");
 const [page, setPage] = useState(1);
const [viewMode, setViewMode] = useState<"grid" | "list">("list");
const [judgments, setJudgments] = useState<JudgmentRow[]>([]);
  const [selectedJudgment, setSelectedJudgment] = useState<JudgmentRow | null>(null);
  const [isJudgmentFullscreen, setIsJudgmentFullscreen] = useState(false);
  const judgmentDocumentRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 const handleDownloadPdf = async () => {
  const element = judgmentDocumentRef.current;
 
  if (!element || !selectedJudgment) {
    alert("Judgment content is not available.");
    return;
  }
 
  // Open a new tab immediately so the browser does not block it.
  const pdfWindow = window.open("", "_blank");
 
  if (!pdfWindow) {
    alert("Please allow pop-ups for this website.");
    return;
  }
 
  try {
    const fileName = (
      selectedJudgment.CaseNo ||
      `JusticeLine_${selectedJudgment.Keycode || "Judgment"}`
    ).replace(/[^a-z0-9_-]/gi, "_");
 
    // Clone the existing judgment template.
    const clone = element.cloneNode(true) as HTMLElement;
 
    // Remove toolbar from the PDF.
    const toolbar = clone.querySelector(".pdf-toolbar");
 
    if (toolbar) {
      toolbar.remove();
    }
 
    // Create temporary PDF container.
   // Create temporary PDF container.
const container = document.createElement("div");
 
container.style.position = "fixed";
container.style.left = "-100000px";
container.style.top = "0";
container.style.width = "180mm";
container.style.backgroundColor = "#ffffff";
 
// Keep the PDF copy centered and within the A4 printable area.
clone.style.backgroundColor = "#ffffff";
clone.style.color = "#351515";
clone.style.width = "180mm";
clone.style.maxWidth = "180mm";
clone.style.margin = "0 auto";
clone.style.boxSizing = "border-box";
 
// Remove the extra responsive padding/max-width from the PDF copy.
const pdfMain = clone.querySelector(".pdf-main") as HTMLElement | null;
 
if (pdfMain) {
  pdfMain.style.width = "100%";
  pdfMain.style.maxWidth = "none";
  pdfMain.style.marginLeft = "0";
  pdfMain.style.marginRight = "0";
  pdfMain.style.paddingLeft = "0";
  pdfMain.style.paddingRight = "0";
  pdfMain.style.boxSizing = "border-box";
}
 
container.appendChild(clone);
document.body.appendChild(container);
 
    // Generate PDF from the same judgment template.
  const pdfBlob = await html2pdf()
  .set({
    margin: [12, 15, 12, 15],
 
    filename: `${fileName}.pdf`,
 
    image: {
      type: "jpeg",
      quality: 0.98,
    },
 
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
 
      onclone: (clonedDocument: Document) => {
        // html2canvas does not support oklch().
        // Replace oklch colors in cloned styles with safe fallback colors.
        const styles = clonedDocument.querySelectorAll("style");
 
        styles.forEach((styleElement) => {
          styleElement.textContent =
            styleElement.textContent?.replace(
              /oklch\([^)]*\)/gi,
              "#351515"
            ) ?? "";
        });
 
        // Also remove any oklch CSS variables from the cloned document.
        const allElements = clonedDocument.querySelectorAll("*");
 
        allElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
 
          const computedStyle =
            clonedDocument.defaultView?.getComputedStyle(htmlElement);
 
          if (!computedStyle) return;
 
          const colorProperties = [
            "color",
            "backgroundColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
          ] as const;
 
          colorProperties.forEach((property) => {
            const value = computedStyle[property];
 
            if (value && value.includes("oklch")) {
              htmlElement.style[property] =
                property === "backgroundColor"
                  ? "#ffffff"
                  : "#351515";
            }
          });
        });
      },
    },
 
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  })
  .from(clone)
  .outputPdf("blob");
 
    // Open generated PDF directly in browser PDF viewer.
    const pdfUrl = URL.createObjectURL(pdfBlob);
 
    pdfWindow.location.href = pdfUrl;
 
    // Remove temporary container.
    document.body.removeChild(container);
 
    // Release the Blob URL later.
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 60000);
 
  } catch (error) {
    console.error("PDF generation failed:", error);
 
    pdfWindow.close();
 
    alert(
      `Unable to generate PDF.\n\n${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
 
 
const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
 
  useEffect(() => {
    setPage(1);
  }, [search, court, year, judge, actOrSection]);
 
  useEffect(() => {
    const abortController = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
try {
  const query = supabase
    .from("judgments")
    .select(
      "id,Keycode,COURT,Judges,CaseNo,Appellant,Respondent,Headnote,HNote,Judgement,Actreferred,Date,Bench,Result,year",
      {
        count: "exact",
      },
    )
    .order("year", { ascending: false });
 
  const filters: string[] = [];
  const term = search.trim();
 
  if (term) {
    filters.push(
      `COURT.ilike.%${term}%`,
      `Judges.ilike.%${term}%`,
      `CaseNo.ilike.%${term}%`,
      `Appellant.ilike.%${term}%`,
      `Respondent.ilike.%${term}%`,
      `Headnote.ilike.%${term}%`,
      `HNote.ilike.%${term}%`,
      `Judgement.ilike.%${term}%`,
      `Actreferred.ilike.%${term}%`,
    );
 
    // Keycode is bigint, so search it using an exact numeric match.
    const keycode = Number(term);
    if (Number.isInteger(keycode)) {
      filters.push(`Keycode.eq.${keycode}`);
    }
  }
 
  if (court.trim()) {
    query.ilike("COURT", `%${court.trim()}%`);
  }
 
  if (judge.trim()) {
    query.ilike("Judges", `%${judge.trim()}%`);
  }
 
  if (actOrSection.trim()) {
    query.ilike("Actreferred", `%${actOrSection.trim()}%`);
  }
 
  if (year.trim()) {
    const parsed = Number(year.trim());
 
    if (!Number.isNaN(parsed)) {
      query.eq("year", parsed);
    }
  }
 
  if (filters.length > 0) {
    query.or(filters.join(","));
  }
 
  query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
 
  const {
    data,
    error: fetchError,
    count: rowCount,
  } = await query;
 
  if (abortController.signal.aborted) return;
 
  if (fetchError) {
    throw fetchError;
  }
 
  setJudgments(data ?? []);
  setCount(rowCount ?? data?.length ?? 0);
}
catch (fetchError: any) {
  console.error("Judgments loading error:", fetchError);
 
  setError(
    fetchError?.message ||
    fetchError?.details ||
    fetchError?.hint ||
    "Unable to load judgments. Please try again.",
  );
}
finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
 
    void load();
    return () => abortController.abort();
  }, [search, court, year, judge, actOrSection, page]);
 
  const hasResults = !isLoading && !error && judgments.length > 0;
 
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        judgments
          .map((item) => {
            if (!item.Date) return null;
            const date = new Date(item.Date);
            return Number.isNaN(date.getTime()) ? null : String(date.getFullYear());
          })
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => Number(b) - Number(a));
  }, [judgments]);
 
  return (
    <>
      <AppHeader title="Judgments" subtitle="Search court judgments and review legal research details." />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
         <section className="rounded-3xl border border-border bg-card px-6 py-5 shadow-elegant">
 
  <div className="mb-4 flex justify-end">
    <Button
      variant="outline"
      onClick={() => {
        setSearch("");
        setCourt("");
        setYear("");
        setJudge("");
        setActOrSection("");
        setPage(1);
      }}
    >
      Clear filters
    </Button>
  </div>
 
 <div className="grid gap-4 md:grid-cols-[1.7fr_1fr] lg:grid-cols-[2fr_1fr_1fr]">
 
    {/* Search judgments */}
    <label className="grid gap-2">
      <span className=" text-base font-semibold text-foreground">
        Search judgments
      </span>
 
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Keycode, court, judges, case number, appellants, headnote, Act referenced…"
          className="pl-10"
        />
      </div>
    </label>
 
    {/* Court */}
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">
        Court
      </span>
      <Input
        value={court}
        onChange={(event) => setCourt(event.target.value)}
        placeholder="High Court, Supreme Court…"
      />
    </label>
 
    {/* Judge */}
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">
        Judge
      </span>
      <Input
        value={judge}
        onChange={(event) => setJudge(event.target.value)}
        placeholder="Judge name or bench…"
      />
    </label>
 
    {/* Act / Section */}
    <label className="grid gap-2">
 
     <span className="text-sm font-semibold text-foreground">
        Act / Section
      </span>
      <Input
        value={actOrSection}
        onChange={(event) => setActOrSection(event.target.value)}
        placeholder="Acts and sections referenced"
      />
    </label>
 
    {/* Year */}
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">
        Year
      </span>
      <Input
        value={year}
        onChange={(event) => setYear(event.target.value)}
        placeholder="2024"
      />
    </label>
 
  </div>
 
</section>
 
          <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="text-sm font-semibold text-foreground">Search results</p>
 
    <p className="text-sm text-muted-foreground">
      {isLoading
        ? "Loading judgments…"
        : error
        ? "Unable to load results."
        : `${count.toLocaleString()} judgment${count === 1 ? "" : "s"} found.`}
    </p>
  </div>
 
  <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
    <Button
      type="button"
      variant={viewMode === "list" ? "default" : "ghost"}
      size="sm"
      className="gap-2"
      onClick={() => setViewMode("list")}
    >
      <List className="h-4 w-4" />
      List
    </Button>
 
 
  </div>
 
            </div>
 
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-3xl border border-border bg-card p-6" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
                <p className="font-semibold">Error loading judgments</p>
                <p>{error}</p>
              </div>
            ) : !judgments.length ? (
              <div className="rounded-3xl border border-border bg-card p-8 text-center">
                <p className="text-lg font-semibold text-foreground">No judgments matched your search.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try broadening your search terms, clearing filters, or checking spelling.
                </p>
              </div>
            ) : (
              <div
  className={
    viewMode === "grid"
      ? "grid gap-4 xl:grid-cols-2"
      : "overflow-hidden rounded-2xl border border-border bg-card"
  }
>
                {judgments.map((judgment) => (
               <article
  key={judgment.id ?? judgment.CaseNo ?? judgment.Keycode ?? judgment.Headnote}
  className={
    viewMode === "grid"
      ? "rounded-3xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-0.5"
      : "border-b border-border bg-card px-5 py-4 transition hover:bg-secondary/30 last:border-b-0"
  }
>
  {viewMode === "grid" ? (
    <>
      {/* GRID VIEW */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {judgment.COURT ?? "Unknown court"}
          </p>
 
          <h3 className="mt-2 text-lg text-muted-foreground">
            <span className="font-medium text-foreground">
              {judgment.Appellant ?? "Appellant"}
            </span>
            {" vs "}
            <span className="font-medium text-foreground">
              {judgment.Respondent ?? "Respondent"}
            </span>
 
 
          </h3>
          <p className="mt-2 text-sm font-semibold text-foreground">{judgment.CaseNo ?? "Case number unavailable"}</p>
        </div>
 
        <div className="space-y-2 text-right">
          <p className="text-sm text-muted-foreground">
            {formatDate(judgment.Date)}
          </p>
 
          {judgment.Result ? (
            <p className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {judgment.Result}
            </p>
          ) : null}
        </div>
      </div>
 
      <div className="mt-4 grid gap-3 rounded-3xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Judges:</span>{" "}
          {judgment.Judges ?? "Not available"}
        </p>
 
        <p>
          <span className="font-semibold text-foreground">Bench:</span>{" "}
          {judgment.Bench ?? "Not available"}
        </p>
 
        <p>
          <span className="font-semibold text-foreground">
            Act / Section:
          </span>{" "}
          {judgment.Actreferred ?? "Not available"}
        </p>
      </div>
 
<div className="mt-4 space-y-3">
        <p className="text-sm font-medium text-foreground">
          Headnote
 
       </p>
 
        <p className="text-sm leading-6 text-muted-foreground">
          {summary(judgment.Headnote ?? judgment.HNote)}
        </p>
      </div>
 
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Keycode:{" "}
          <span className="font-medium text-foreground">
            {judgment.Keycode ?? "N/A"}
          </span>
        </div>
 
        <Button
          variant="outline"
          className="inline-flex items-center gap-2"
          onClick={() => setSelectedJudgment(judgment)}
        >
          View Judgment
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  ) : (
    <>
      {/* LIST VIEW */}
      <button
        type="button"
        onClick={() => setSelectedJudgment(judgment)}
        className="grid w-full grid-cols-1 gap-3 text-left md:grid-cols-[minmax(0,1fr)_220px] md:items-center"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {judgment.COURT ?? "Unknown court"}
          </p>
 
         
 
          <p className="mt-1 truncate text-lg text-muted-foreground">
            <span className="font-medium text-foreground">
              {judgment.Appellant ?? "Appellant"}
            </span>
            {" vs "}
            <span className="font-medium text-foreground">
              {judgment.Respondent ?? "Respondent"}
            </span>
          </p>
          <p className="mt-2 line-clamp-1 text-sm text-foreground">
  {summary(
    judgment.Judgement ?? judgment.Headnote ?? judgment.HNote,
    25
  )}
</p>
 
<button
  type="button"
  onClick={() => setSelectedJudgment(judgment)}
  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
>
  See more
  <ChevronRight className="h-4 w-4" />
</button>
        </div>
 
        <div className="text-left md:text-right">
          <p className="text-sm text-muted-foreground">
            {formatDate(judgment.Date)}
          </p>
 
          {judgment.Result ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {judgment.Result}
            </p>
          ) : null}
        </div>
      </button>
    </>
  )}
</article>
                ))}
              </div>
            )}
          </section>
 
          {hasResults && totalPages > 1 && (
            <Pagination className="rounded-3xl border border-border bg-card p-4 shadow-elegant">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
  href="#"
  aria-disabled={page <= 1}
  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
  onClick={(event) => {
    event.preventDefault();
 
    if (page <= 1) return;
 
    setPage((current) => Math.max(1, current - 1));
  }}
/>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  if (totalPages > 7 && pageNumber > 2 && pageNumber < totalPages - 1 && Math.abs(pageNumber - page) > 1) {
                    if (pageNumber === 3 || pageNumber === totalPages - 2) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNumber}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                 <PaginationNext
  href="#"
  aria-disabled={page >= totalPages}
  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
  onClick={(event) => {
    event.preventDefault();
 
    if (page >= totalPages) return;
 
    setPage((current) => Math.min(totalPages, current + 1));
  }}
/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
 
<Dialog
  open={Boolean(selectedJudgment)}
  onOpenChange={(open) => {
    if (!open) {
      setSelectedJudgment(null);
      setIsJudgmentFullscreen(false);
    }
  }}
>
  <DialogContent
    className={
      isJudgmentFullscreen
        ? "h-screen w-screen max-w-none overflow-y-auto rounded-none bg-[#FBFAF6] p-0"
        : "max-h-[95vh] max-w-6xl overflow-y-auto bg-[#FBFAF6] p-0"
    }
  >
         {selectedJudgment && (
<div
  ref={judgmentDocumentRef}
  className="pdf-document min-h-full bg-white text-[#351515]"
>
{/* =====================================================
    TOP TOOLBAR
====================================================== */}
<div className="pdf-toolbar sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#E4DCD2] bg-white px-6 shadow-sm">
 
  {/* Title */}
  <h2 className="text-xl font-bold text-[#351515]">
    Judgement Details
  </h2>
 
  {/* Actions */}
  <div className="flex items-center gap-2">
 
     {/* View PDF */}
            <Button
  type="button"
  variant="outline"
  onClick={handleDownloadPdf}
  className="rounded-full border-slate-200 px-5 text-[#17233c]"
>
  <Printer className="mr-2 h-4 w-4" />
  View PDF
</Button>
 
    {/* Fullscreen */}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() =>
        setIsJudgmentFullscreen((current) => !current)
      }
      className="
        h-9 w-9
        text-[#806B5F]
        hover:bg-[#F5EEDC]
        hover:text-[#351515]
      "
      title={
        isJudgmentFullscreen
          ? "Exit fullscreen"
          : "Fullscreen"
      }
    >
      {isJudgmentFullscreen ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <Maximize2 className="h-5 w-5" />
      )}
    </Button>
 
    {/* Close */}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => {
        setSelectedJudgment(null);
        setIsJudgmentFullscreen(false);
      }}
      className="
        h-9 w-9
        text-[#806B5F]
        hover:bg-[#F5EEDC]
        hover:text-[#351515]
      "
      title="Close"
    >
      <X className="h-5 w-5" />
    </Button>
 
  </div>
</div>
 
 
    {/* =====================================================
            DOCUMENT
        ====================================================== */}
        <main className="pdf-main mx-auto max-w-5xl px-8 py-10 sm:px-14">
 
          {/* =================================================
              CITATION
          ================================================== */}
          <section className="text-center">
 
          {selectedJudgment.Keycode && (
  <h1 className="text-xl font-bold text-[#351515]">
    {new Date(selectedJudgment.Date ?? "").getFullYear()} JusticeLine {selectedJudgment.Keycode}
  </h1>
)}
 
            {/* COURT */}
            <h2 className="mt-3 text-xl font-bold uppercase text-[#351515]">
              {selectedJudgment.COURT ?? "COURT"}
            </h2>
 
            {/* APPELLANT */}
            <p className="mt-4 text-lg font-bold leading-7 text-[#351515]">
              {selectedJudgment.Appellant ?? "Appellant"}
              <span className="font-normal text-[#806B5F]">
                {" "}– Appellants
              </span>
            </p>
 
            {/* VERSUS */}
            <p className="my-2 text-lg font-bold text-[#351515]">
              Versus
            </p>
 
            {/* RESPONDENT */}
            <p className="text-lg font-bold leading-7 text-[#351515]">
              {selectedJudgment.Respondent ?? "Respondent"}
              <span className="font-normal text-[#806B5F]">
                {" "}– Respondents
              </span>
            </p>
 
            {/* CASE NUMBER */}
            <p className="mt-4 text-base text-[#806B5F]">
              {selectedJudgment.CaseNo ?? "Case number unavailable"}
            </p>
 
            {/* DATE */}
            <p className="mt-2 text-base text-[#806B5F]">
              <span className="font-medium text-[#351515]">
                Decided On :
              </span>{" "}
              {formatDate(selectedJudgment.Date)}
            </p>
          </section>
 
     
 
          {/* =================================================
              ACTS REFERRED
          ================================================== */}
          <section className="mt-8">
            <h3 className="mb-4 text-base font-bold text-[#351515]">
              Act Referred :
            </h3>
 
            <div className="space-y-3">
              {selectedJudgment.Actreferred ? (
                selectedJudgment.Actreferred
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((act, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-full
                          bg-[#F5EEDC]
                          text-sm
                          font-bold
                          text-[#B88932]
                        "
                      >
                        {index + 1}
                      </span>
 
                      <p className="pt-1 text-base leading-7 text-[#351515]">
                        {act.replace(
                          /^\s*\d+[\.\)]\s*/,
                          ""
                        )}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-[#806B5F]">
                  No acts referred.
                </p>
              )}
            </div>
          </section>
 
          {/* =================================================
              JUDGES
          ================================================== */}
          <section className="mt-8">
            <h3 className="mb-4 text-base font-bold text-[#351515]">
              Judges :
            </h3>
 
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {selectedJudgment.Judges ? (
                selectedJudgment.Judges
                  .split(/[,;\n]+/)
                  .map((judge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      <span
                        className="
                          flex h-8 w-8
                          items-center justify-center
                          rounded-full
                          bg-[#F5EEDC]
                          text-sm
                          font-bold
                          text-[#B88932]
                        "
                      >
                        {index + 1}
                      </span>
 
                      <span className="text-base text-[#351515]">
                        {judge.trim()}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-[#806B5F]">
                  No judges available.
                </p>
              )}
            </div>
          </section>
 
          {/* =================================================
              ADVOCATES
          ================================================== */}
 
          {selectedJudgment.Advocates && (
            <section className="mt-8">
              <h3 className="mb-4 text-base font-bold text-[#351515]">
                Advocates :
              </h3>
 
              <div
                className="text-base leading-8 text-[#351515]"
                dangerouslySetInnerHTML={{
                  __html: selectedJudgment.Advocates,
                }}
              />
            </section>
          )}
{/* =================================================
    HEADNOTE
================================================== */}
{(selectedJudgment.Headnote ||
  selectedJudgment.HNote) && (
  <section className="mt-10 border-t border-[#E4DCD2] pt-8">
<h3 className="mb-4 text-lg font-bold text-[#351515]">
  Headnote
</h3>
 
    <div
      className="
        text-base
        leading-8
        text-[#351515]
      "
      dangerouslySetInnerHTML={{
        __html:
          selectedJudgment.Headnote ||
          selectedJudgment.HNote ||
          "",
      }}
    />
  </section>
)}
          {/* =================================================
              FULL JUDGMENT
          ================================================== */}
          <section className="mt-5 border-t border-[#E4DCD2] pt-5">
            <h3 className="mb-6 text-lg font-bold text-[#351515]">
              Judgment
            </h3>
 
            <div
              className="
                judgment-content
                text-justify
                text-base
                leading-8
                text-[#351515]
              "
              dangerouslySetInnerHTML={{
                __html:
                  selectedJudgment.Judgement ||
                  "<p>Judgment text is not available.</p>",
              }}
            />
          </section>
 
          {/* =================================================
              RESULT
          ================================================== */}
 
          {selectedJudgment.Result && (
            <section className="mt-10 border-t border-[#E4DCD2] pt-8">
              <h3 className="mb-4 text-lg font-bold text-[#351515]">
                Result
              </h3>
 
              <p className="text-base leading-8 text-[#351515]">
                {selectedJudgment.Result}
              </p>
            </section>
          )}
 
        </main>
      </div>
    )}
  </DialogContent>
</Dialog>
    </>
  );
}
 
 
 
 