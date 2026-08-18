import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pencil, Copy, Download, Printer, ArrowLeft, FileText, Bookmark,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { buildDoc, docToPlainText, docToWordHtml, type LegalDoc } from "@/lib/legal-templates";
import { getCurrentDraft, saveDraftToLibrary, type CurrentDraft } from "@/lib/drafts-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_workspace/draft/preview")({
  head: () => ({
    meta: [
      { title: "Draft Preview · JusticeLine AI" },
      { name: "description", content: "Review, edit, and export your generated legal draft." },
      { property: "og:title", content: "Draft Preview · JusticeLine AI" },
      { property: "og:description", content: "Export as PDF or DOCX." },
    ],
  }),
  component: DraftPreview,
});

function DraftPreview() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<CurrentDraft | null>(null);

  useEffect(() => {
    const cur = getCurrentDraft();
    if (cur) setDraft(cur);
    else {
      // Fallback demo: build a Sale Deed if no draft data present
      setDraft({
        slug: "sale-deed",
        title: "Sale Deed",
        category: "Property Documents",
        data: {},
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  const doc: LegalDoc | null = useMemo(
    () => (draft ? buildDoc(draft.slug, draft.data) : null),
    [draft],
  );

  if (!draft || !doc) return null;

  const editHref = draft.slug === "sale-deed" ? "/draft/sale-deed" : `/draft/${draft.slug}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(docToPlainText(doc));
      toast.success("Draft copied successfully.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const onPrint = () => window.print();

  const onDownloadDocx = () => {
    const html = docToWordHtml(doc);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    triggerDownload(blob, `${doc.title.replace(/\s+/g, "_")}.doc`);
    toast.success("DOCX downloaded.");
  };

  const onDownloadPdf = () => {
    toast.message("Opening print dialog", { description: "Choose 'Save as PDF' as the destination to download." });
    setTimeout(() => window.print(), 200);
  };

  const onSave = () => {
    const saved = saveDraftToLibrary(draft);
    toast.success("Draft saved", { description: `${saved.title} · ${saved.documentNumber}` });
  };

  return (
    <>
      <div className="no-print">
        <AppHeader title={`${doc.title} — Draft Preview`} subtitle={`${doc.documentNumber} · v${doc.version} · ${doc.executionDate}`} />
      </div>
      <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: editHref })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to form
        </Button>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: editHref })}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadPdf}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadDocx}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" className="bg-brand-gradient text-white hover:opacity-95" onClick={onSave}>
            <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save Draft
          </Button>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto bg-neutral-200/60 p-4 sm:p-8 print:bg-white print:p-0 dark:bg-neutral-900/40">
        <LegalDocument doc={doc} />
        <div className="no-print mx-auto mt-6 max-w-[820px] text-center text-xs text-muted-foreground">
          <Link to="/saved" className="inline-flex items-center gap-1 hover:text-primary">
            <FileText className="h-3 w-3" /> View all saved drafts
          </Link>
        </div>
      </main>
    </>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
