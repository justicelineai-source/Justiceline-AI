import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Copy,
  Download,
  Printer,
  ArrowLeft,
  FileText,
  Bookmark,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {LegalDocument} from "@/components/legal/LegalDocument";
import { buildDoc, docToPlainText, docToWordHtml, type LegalDoc } from "@/lib/legal-templates";
import { getCurrentDraft, saveDraftToLibrary, type CurrentDraft } from "@/lib/drafts-store";
import { toast } from "sonner";
 
export const Route = createFileRoute("/_workspace/draft/preview")({
  component: DraftPreview,
});
 
function DraftPreview() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<CurrentDraft | null>(null);
 
  useEffect(() => {
    const cur = getCurrentDraft();
    if (cur) setDraft(cur);
  }, []);
 
  const doc: LegalDoc | null = useMemo(
    () => (draft ? buildDoc(draft.slug, draft.data) : null),
    [draft]
  );
 
  if (!draft || !doc) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No active draft found. Please select a template to generate a document.
      </div>
    );
  }
 
  const editHref = `/draft/${draft.slug}`;
 
  const onCopy = async () => {
    await navigator.clipboard.writeText(docToPlainText(doc));
    toast.success("Draft copied to clipboard.");
  };
 
  const onDownloadPdf = () => {
    toast.info("Opening print dialog — select 'Save as PDF'");
    setTimeout(() => window.print(), 200);
  };
 
  const onDownloadDocx = () => {
    const html = docToWordHtml(doc);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, "_")}.doc`;
    a.click();
    toast.success("Word document downloaded.");
  };
 
  return (
    <>
      <div className="no-print">
        <AppHeader
          title={`${doc.title} — Preview`}
          subtitle={`Ref: ${doc.documentNumber} · ${doc.executionDate}`}
        />
      </div>
 
      <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: editHref })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to form
        </Button>
 
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: editHref })}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadPdf}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Save as PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadDocx}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Word DOC
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>
 
      <main className="flex-1 overflow-y-auto bg-neutral-200/60 p-4 sm:p-8 print:bg-white print:p-0 dark:bg-neutral-900/40">
        <LegalDocument doc={doc} />
      </main>
    </>
  );
}