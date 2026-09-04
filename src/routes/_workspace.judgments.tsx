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
    // Open a judgment preview automatically when coming
  // from AI Chat using /judgments?id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const judgmentId = params.get("id");

    if (!judgmentId) return;

    const openJudgmentFromUrl = async () => {
      try {
        const { data, error } = await (supabase as any)
  .from("judgments")
  .select(
    "id,Keycode,COURT,Judges,CaseNo,Appellant,Respondent,Headnote,HNote,Judgement,Actreferred,Date,Bench,Result,year"
  )
  .eq("id", judgmentId)
  .maybeSingle();

        if (error) {
          console.error("Unable to load judgment from URL:", error);
          return;
        }

        if (data) {
          setSelectedJudgment(data);
        }
      } catch (error) {
        console.error("Unable to open judgment preview:", error);
      }
    };

    openJudgmentFromUrl();
  }, []);
const handleDownloadPdf = async () => {
  const element = judgmentDocumentRef.current;
 
  if (!element || !selectedJudgment) {
    alert("Judgment content is not available.");
    return;
  }
 
  // Open immediately to prevent browser popup blocking.
  const pdfWindow = window.open("", "_blank");
 
  if (!pdfWindow) {
    alert("Please allow pop-ups for this website.");
    return;
  }
 
  let container: HTMLDivElement | null = null;
 
  try {
    const fileName = (
      selectedJudgment.CaseNo ||
      `JusticeLine_${selectedJudgment.Keycode || "Judgment"}`
    ).replace(/[^a-z0-9_-]/gi, "_");
 
    /*
      =====================================================
      CREATE PDF-ONLY COPY
      This does NOT change preview/fullscreen/original page.
      =====================================================
    */
 
    const clone = element.cloneNode(true) as HTMLElement;
 
    // Remove website toolbar from PDF.
    clone.querySelector(".pdf-toolbar")?.remove();
 
    /*
      =====================================================
      CREATE OFFSCREEN CONTAINER
      =====================================================
    */
 
    container = document.createElement("div");
 
    container.style.position = "fixed";
    container.style.left = "-100000px";
    container.style.top = "0";
    container.style.width = "210mm";
    container.style.margin = "0";
    container.style.padding = "0";
    container.style.background = "#ffffff";
    container.style.zIndex = "-1";
 
    /*
      =====================================================
      PDF DOCUMENT SIZE
      =====================================================
    */
 
    clone.style.width = "210mm";
    clone.style.minHeight = "297mm";
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.background = "#ffffff";
    clone.style.color = "#1f1a17";
    clone.style.boxSizing = "border-box";
 
    /*
      =====================================================
      PDF-ONLY PROFESSIONAL STYLE
      This is applied ONLY to the cloned PDF.
      =====================================================
    */
 
    const pdfStyle = document.createElement("style");
 
  pdfStyle.textContent = `
  /* =========================================================
     JUSTICELINE REFERENCE PDF LAYOUT
     Based on Safari_4264.pdf
     PDF GENERATION ONLY
  ========================================================= */

  *,
  *::before,
  *::after {
    box-sizing: border-box !important;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #222222 !important;
  }

  /* =========================================================
     DOCUMENT
  ========================================================= */

  .pdf-document {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #222222 !important;
    font-family: Georgia, "Times New Roman", serif !important;
  }

  /* =========================================================
     MAIN PAGE AREA
     Similar wide margins to reference PDF
  ========================================================= */

  .pdf-main {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;

    padding:
      14mm
      18mm
      20mm
      18mm !important;

    background: #ffffff !important;
    color: #222222 !important;
    font-family: Georgia, "Times New Roman", serif !important;
  }

  /* =========================================================
     HIDE WEBSITE TOOLBAR
  ========================================================= */

  .pdf-toolbar {
    display: none !important;
  }

  /* =========================================================
     GLOBAL FONT
  ========================================================= */

  .pdf-main,
  .pdf-main div,
  .pdf-main p,
  .pdf-main span,
  .pdf-main li,
  .pdf-main h1,
  .pdf-main h2,
  .pdf-main h3,
  .pdf-main h4,
  .pdf-main h5,
  .pdf-main h6 {
    color: #222222 !important;
    font-family: Georgia, "Times New Roman", serif !important;
  }

  /* =========================================================
     HEADER AREA
     JusticeLine-style header if these elements exist
  ========================================================= */

  .pdf-header {
    width: 100% !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;

    margin: 0 0 5mm 0 !important;
    padding: 0 0 4mm 0 !important;

    border-bottom: 1px solid #8d8d8d !important;

    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .pdf-header-logo {
    max-width: 62mm !important;
    height: auto !important;
  }

  .pdf-license {
    font-size: 9.5pt !important;
    line-height: 1.3 !important;
    text-align: right !important;
    padding-top: 1mm !important;
  }

  /* =========================================================
     CASE HEADER
  ========================================================= */

  .pdf-main > section:first-child {
    width: 100% !important;

    margin: 0 0 7mm 0 !important;
    padding: 0 !important;

    text-align: center !important;

    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Citation number */

  .pdf-main h1 {
    font-size: 11pt !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;

    margin: 0 0 4mm 0 !important;
    padding: 0 !important;

    text-align: center !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* Court name */

  .pdf-main h2 {
    font-size: 14pt !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;

    margin: 0 0 4mm 0 !important;
    padding: 0 !important;

    text-align: center !important;

    text-transform: uppercase !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* Equivalent citation / bench / parties / case details */

  .pdf-main > section:first-child p {
    font-size: 10.5pt !important;
    line-height: 1.45 !important;

    margin: 2mm 0 !important;
    padding: 0 !important;

    text-align: center !important;
  }

  /* =========================================================
     CASE TITLE
  ========================================================= */

  .pdf-main .case-title,
  .pdf-main .party-title {
    font-size: 15pt !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;

    margin: 5mm 0 5mm 0 !important;

    text-align: center !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* =========================================================
     GENERAL SECTIONS
  ========================================================= */

  .pdf-main section {
    width: 100% !important;

    margin-bottom: 0 !important;

    /*
      Let long sections flow naturally.
      This prevents large blank spaces.
    */
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .pdf-main section.mt-5 {
    margin-top: 5mm !important;
  }

  .pdf-main section.mt-8 {
    margin-top: 6mm !important;
  }

  .pdf-main section.mt-10 {
    margin-top: 7mm !important;
  }

  /* =========================================================
     SMALL METADATA BLOCKS
  ========================================================= */

  .pdf-main .acts-section,
  .pdf-main .judges-section,
  .pdf-main .cases-cited-section,
  .pdf-main .advocates-section {
    margin-top: 5mm !important;
    margin-bottom: 0 !important;

    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  /* =========================================================
     SECTION HEADINGS
  ========================================================= */

  .pdf-main h3 {
    font-size: 11pt !important;
    font-weight: 700 !important;
    line-height: 1.4 !important;

    margin: 0 0 3mm 0 !important;
    padding: 0 !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* =========================================================
     NORMAL CONTENT
  ========================================================= */

  .pdf-main p,
  .pdf-main li {
    font-size: 10.5pt !important;
    line-height: 1.45 !important;

    margin: 0 0 3mm 0 !important;
    padding: 0 !important;

    text-align: left !important;

    break-inside: auto !important;
    page-break-inside: auto !important;

    orphans: 2 !important;
    widows: 2 !important;
  }

  /* =========================================================
     HEADNOTE
  ========================================================= */

  .pdf-main .headnote-section {
    margin-top: 5mm !important;

    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .pdf-main .headnote-section h3 {
    margin-bottom: 3mm !important;
  }

  .pdf-main .headnote-section p,
  .pdf-main .headnote-section div,
  .pdf-main .headnote-section span {
    font-size: 10.5pt !important;
    line-height: 1.45 !important;
  }

  /* =========================================================
     JUDGMENT SECTION
     
     IMPORTANT:
     NO FORCED NEW PAGE.
     Reference PDF starts Judgment on Page 1.
  ========================================================= */

  .pdf-main .judgment-section {
    width: 100% !important;

    margin-top: 6mm !important;
    padding-top: 4mm !important;

    /*
      Remove any previous forced page break.
    */
    break-before: auto !important;
    page-break-before: auto !important;

    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  /* =========================================================
     JUDGMENT HEADING
  ========================================================= */

  .pdf-main .judgment-section h3 {
    font-size: 12pt !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;

    margin: 0 0 4mm 0 !important;
    padding: 0 !important;

    text-transform: uppercase !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* =========================================================
     JUDGE / AUTHOR LINE
     Example: Dr. Neela Kedar Gokhale, J.: --
  ========================================================= */

  .pdf-main .judgment-author {
    font-size: 11pt !important;
    font-weight: 700 !important;
    font-style: italic !important;

    line-height: 1.4 !important;

    margin: 0 0 4mm 0 !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* =========================================================
     JUDGMENT CONTENT
  ========================================================= */

  .pdf-main .judgment-content {
    display: block !important;

    width: 100% !important;

    margin: 0 0 4mm 0 !important;
    break-inside: avoid !important
    page-break-inside: avoid !important;
    orphans: 3 !important;
    windows: 3 !important;
  }
    

    font-size: 10.5pt !important;
    line-height: 1.45 !important;

    color: #222222 !important;

    /*
      Reference PDF uses justified legal text.
    */
    text-align: justify !important;

    break-before: auto !important;
    break-after: auto !important;
    break-inside: auto !important;

    page-break-before: auto !important;
    page-break-after: auto !important;
    page-break-inside: auto !important;
  }

  /* =========================================================
     JUDGMENT PARAGRAPHS
  ========================================================= */

  .pdf-main .judgment-content p {
    display: block !important;

    font-size: 10.5pt !important;
    line-height: 1.45 !important;

    color: #222222 !important;

    text-align: justify !important;

    margin: 0 0 3.5mm 0 !important;
    padding: 0 !important;

    /*
      Paragraphs flow naturally from one page
      to the next without forcing blank areas.
    */
    break-inside: auto !important;
    page-break-inside: auto !important;

    orphans: 2 !important;
    widows: 2 !important;
  }

  /* =========================================================
     REMOVE EXTRA SPACE FROM FIRST/LAST PARAGRAPH
  ========================================================= */

  .pdf-main .judgment-content p:first-child {
    margin-top: 0 !important;
  }

  .pdf-main .judgment-content p:last-child {
    margin-bottom: 0 !important;
  }

  /* =========================================================
     QUOTED LAW / BLOCK CONTENT
  ========================================================= */

  .pdf-main blockquote {
    margin: 3mm 5mm !important;
    padding: 0 !important;

    font-size: 10.5pt !important;
    line-height: 1.45 !important;

    text-align: justify !important;

    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  /* =========================================================
     BORDERS
  ========================================================= */

  .pdf-main .border-t {
    border-top: 1px solid #c8c8c8 !important;
  }

  /* =========================================================
     TABLES
  ========================================================= */

  .pdf-main table {
    width: 100% !important;
    border-collapse: collapse !important;

    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .pdf-main tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* =========================================================
     IMAGES
  ========================================================= */

  .pdf-main img {
    max-width: 100% !important;
    height: auto !important;
  }

  /* =========================================================
     REMOVE WEBSITE WIDTH RESTRICTIONS
  ========================================================= */

  .pdf-main .max-w-5xl,
  .pdf-main .max-w-4xl,
  .pdf-main .max-w-3xl,
  .pdf-main .mx-auto {
    max-width: none !important;

    margin-left: 0 !important;
    margin-right: 0 !important;
  }
`;
 
    clone.prepend(pdfStyle);
 
    container.appendChild(clone);
    document.body.appendChild(container);
 
    /*
      =====================================================
      GENERATE PDF
      =====================================================
    */
 
    const pdfBlob = await html2pdf()
  .set({
        margin: 0,
 
        filename: `${fileName}.pdf`,
 
        image: {
          type: "jpeg",
          quality: 0.98,
        },
 
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
 
          /*
            IMPORTANT:
            Remove website styles containing oklch().
            This affects ONLY html2canvas's cloned document.
          */
 
          onclone: (clonedDocument: Document) => {
            /*
              Remove all stylesheet links.
              Tailwind/shadcn modern CSS can contain oklch().
            */
 
            clonedDocument
              .querySelectorAll('link[rel="stylesheet"]')
              .forEach((link) => link.remove());
 
            /*
              Remove all existing style tags that may contain
              oklch(), oklab(), CSS variables, etc.
            */
 
            clonedDocument
              .querySelectorAll("style")
              .forEach((style) => style.remove());
 
            /*
              Find the PDF document inside html2canvas clone.
            */
 
            const pdfDocument = clonedDocument.querySelector(
              ".pdf-document"
            ) as HTMLElement | null;
 
            if (!pdfDocument) return;
 
 
            /*
              Add completely PDF-safe CSS.
              No oklch(), no Tailwind colors.
            */
 
            const safeStyle = clonedDocument.createElement("style");
 
            safeStyle.textContent = `
              * {
                box-sizing: border-box !important;
              }
 
              html,
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #1f1a17 !important;
              }
 
              .pdf-document {
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #1f1a17 !important;
                font-family: Georgia, "Times New Roman", serif !important;
              }
 
              .pdf-toolbar {
                display: none !important;
              }
 
              .pdf-main {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 14mm 16mm 18mm 16mm !important;
                background: #ffffff !important;
                color: #1f1a17 !important;
              }
 
              .pdf-main,
              .pdf-main * {
                color: #1f1a17 !important;
                font-family: Georgia, "Times New Roman", serif !important;
              }
 
              .pdf-main > section:first-child {
                text-align: center !important;
                margin-bottom: 12mm !important;
              }
 
              h1 {
                font-size: 18pt !important;
                font-weight: 700 !important;
                line-height: 1.3 !important;
                text-align: center !important;
                margin: 0 0 5mm 0 !important;
              }
 
              h2 {
                font-size: 15pt !important;
                font-weight: 700 !important;
                line-height: 1.35 !important;
                text-align: center !important;
                margin: 0 0 5mm 0 !important;
              }
 
              h3 {
                font-size: 12pt !important;
                font-weight: 700 !important;
                line-height: 1.4 !important;
                margin: 0 0 4mm 0 !important;
              }
 
              .pdf-main > section:first-child p {
                font-size: 10.5pt !important;
                line-height: 1.55 !important;
                text-align: center !important;
                margin: 2.5mm 0 !important;
              }
 
              section {
                margin-top: 8mm !important;
              }
 
              p,
              li,
              .judgment-content,
              .judgment-content p,
              .judgment-content div,
              .judgment-content span,
              .judgment-content li {
                font-size: 10.5pt !important;
                line-height: 1.55 !important;
              }
 
              .judgment-content,
              .judgment-content p,
              .judgment-content div,
              .judgment-content span,
              .judgment-content li {
                text-align: justify !important;
              }
 
              .judgment-content p {
                margin: 0 0 4mm 0 !important;
              }
 
              .border-t {
                border-top: 1px solid #d9d1c8 !important;
              }
 
              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                break-after: avoid !important;
                page-break-after: avoid !important;
              }
 
              table,
              tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
 
              img {
                max-width: 100% !important;
              }
            `;
 
            clonedDocument.head.appendChild(safeStyle);
 
            /*
              Remove any inline modern color values.
            */
 
            clonedDocument.querySelectorAll("*").forEach((node) => {
              const htmlElement = node as HTMLElement;
 
              const inlineStyle =
                htmlElement.getAttribute("style") || "";
 
              if (
                inlineStyle.includes("oklch") ||
                inlineStyle.includes("oklab")
              ) {
                htmlElement.setAttribute(
                  "style",
                  inlineStyle
                    .replace(/oklch\([^)]*\)/gi, "#1f1a17")
                    .replace(/oklab\([^)]*\)/gi, "#1f1a17")
                );
              }
            });
          },
        },
 
        /*
          IMPORTANT:
          jsPDF MUST BE HERE.
          NOT inside html2canvas.
        */
 
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
 
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".judgmentcontent p"],
        },
           } as any)
      .from(clone)
      .outputPdf("blob");
 
    /*
      =====================================================
      OPEN PDF
      =====================================================
    */
 
    const pdfUrl = URL.createObjectURL(pdfBlob);
 
    pdfWindow.location.href = pdfUrl;
 
    /*
      Cleanup
    */
 
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
      container = null;
    }
 
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 60000);
 
  } catch (error) {
    console.error("PDF generation failed:", error);
 
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
 
    pdfWindow.close();
 
    alert(
      `Unable to open PDF.\n\n${
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
 const query = (supabase as any)
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
  ? "h-screen w-screen max-w-none overflow-y-auto rounded-none bg-white p-0"
  : "max-h-[95vh] max-w-6xl overflow-y-auto bg-white p-0"
 
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
  {/* Show View button only in fullscreen */}
  {isJudgmentFullscreen && (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownloadPdf}
      className="rounded-full border-slate-200 px-5 text-[#17233c]"
    >
      <Printer className="mr-2 h-4 w-4" />
      View
    </Button>
  )}
 
  {/* Fullscreen Toggle */}
  <Button
    type="button"
    variant="ghost"
    onClick={() => setIsJudgmentFullscreen((current) => !current)}
   className={`rounded-full h-9 px-4 hover:bg-[#F5EEDC] ${
  isJudgmentFullscreen
    ? "text-black hover:text-black"
    : "text-[#806B5F] hover:text-[#351515]"
}`}
    title={isJudgmentFullscreen ? "Exit Fullscreen" : "Open"}
 
 >
    {isJudgmentFullscreen ? (
      <>
        <Minimize2 className="mr-2 h-4 w-4" />
        Minimize
      </>
    ) : (
      <>
        <Maximize2 className="mr-2 h-4 w-4" />
        Open
      </>
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
                    <div className="flex items-start gap-4 py-2">
  <span className="w-0 shrink-0 text-base font-semibold text-black">
    {index + 1}.
  </span>
 
  <span className="flex-1 text-[15px] leading-7 text-gray-900">
    {judge.trim()}
  </span>
</div>
 
                      <p className="pt-1 text-base leading-7 text-black">
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
                      <div className="flex items-start gap-4 py-2">
  <span className="w-1 shrink-0 text-base font-semibold text-black">
    {index + 1}.
  </span>
 
  <span className="flex-1 text-[15px] leading-7 text-gray-900">
    {judge.trim()}
  </span>
</div>
 
                      <span className="text-base text-black">
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
 
 
 
 
 