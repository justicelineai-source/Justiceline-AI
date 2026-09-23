import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Download, FileDown, Copy, Check, FileText, Loader2 } from "lucide-react";
import type { LegalDoc } from "@/lib/legal-templates";
import { normalizeDraftMarkdown } from "@/lib/dynamic-draft-form";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
 
interface LegalDocumentProps {
  doc?: LegalDoc | null;
  content?: string;
  title?: string;
}
 
export function LegalDocument({ doc, content, title }: LegalDocumentProps) {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
 
  const formattedContent = useMemo(() => {
    return content ? normalizeDraftMarkdown(content) : "";
  }, [content]);
 
  if (!doc && !formattedContent) {
    return (
      <div className="mx-auto flex min-h-[300px] max-w-[850px] items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No document data available to preview.
      </div>
    );
  }
 
  const docTitle = doc?.title || title || "LEGAL DRAFT DOCUMENT";
  const docNumber = doc?.documentNumber || `JL-${Math.floor(100000 + Math.random() * 900000)}`;
  const executionDate = doc?.executionDate || new Date().toLocaleDateString("en-IN");
  const version = doc?.version || "1.0";
  const cleanFilename = docTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
 
  // Helper: Generates pure, isolated HTML with standard hex colors (No Tailwind, No oklch)
  const buildIsolatedHtml = () => {
    let bodyHtml = "";
 
    if (formattedContent) {
      bodyHtml = formattedContent
        .replace(/^### (.*$)/gim, '<h3 style="font-size:13pt;font-weight:bold;margin-top:16pt;margin-bottom:6pt;color:#000000;text-transform:uppercase;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size:14pt;font-weight:bold;margin-top:20pt;margin-bottom:8pt;border-bottom:1px solid #333333;padding-bottom:4pt;color:#000000;text-transform:uppercase;">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="font-size:16pt;font-weight:bold;text-align:center;color:#000000;text-transform:uppercase;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#000000;font-weight:bold;">$1</strong>')
        .split("\n\n")
        .map((p) => {
          const trimmed = p.trim();
          if (!trimmed) return "";
          if (trimmed.startsWith("<h")) return trimmed;
          return `<p style="margin:0 0 10pt 0;text-align:justify;line-height:1.6;font-size:11pt;color:#111111;">${trimmed.replace(/\n/g, "<br/>")}</p>`;
        })
        .join("");
    } else if (doc?.clauses) {
      bodyHtml = doc.clauses
        .map(
          (c) =>
            `<h3 style="font-size:12pt;font-weight:bold;margin-top:14pt;margin-bottom:4pt;color:#000000;">${c.number}. ${c.heading}</h3><p style="margin:0 0 10pt 0;text-align:justify;line-height:1.6;font-size:11pt;color:#111111;">${c.body}</p>`
        )
        .join("");
    }
 
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px 50px;
            background-color: #ffffff;
            color: #111111;
            font-family: 'Times New Roman', Times, serif;
          }
          .doc-header {
            text-align: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .court-title {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            font-weight: bold;
            letter-spacing: 1.5px;
            color: #555555;
            text-transform: uppercase;
            margin: 0 0 6px 0;
          }
          .doc-title {
            font-size: 17pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #000000;
            margin: 6px 0;
          }
          .doc-meta {
            font-size: 9.5pt;
            color: #555555;
            margin: 0;
          }
          .doc-body {
            font-size: 11pt;
            line-height: 1.6;
          }
          .verification-section {
            margin-top: 40px;
            border-top: 1px dashed #777777;
            padding-top: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <p class="court-title">In The Relevant Court Of Law / Official Legal Instrument</p>
          <div class="doc-title">${docTitle}</div>
          <p class="doc-meta">Ref: ${docNumber} &nbsp;•&nbsp; Version: ${version} &nbsp;•&nbsp; Date: ${executionDate}</p>
        </div>
 
        <div class="doc-body">
          ${bodyHtml}
        </div>
 
        <div class="verification-section">
          <table>
            <tr>
              <td style="width: 60%;">
                <p style="font-size:10pt;font-weight:bold;margin:0 0 4px 0;color:#000000;">VERIFICATION:</p>
                <p style="font-size:9.5pt;color:#444444;margin:0;">Verified that the contents of this instrument are true to my knowledge and belief.</p>
              </td>
              <td style="width: 40%; text-align: right; vertical-align: bottom;">
                <div style="border-bottom: 1px dashed #555555; width: 170px; margin: 0 0 8px auto;"></div>
                <p style="font-size:10pt;font-weight:bold;text-transform:uppercase;margin:0;color:#000000;">DEPONENT / EXECUTANT</p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  };
 
  // 1. Copy formatted text
  const handleCopy = async () => {
    const textToCopy = formattedContent || JSON.stringify(doc, null, 2);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  // 2. Direct PDF Download (Uses Sandboxed Iframe - 100% immune to oklch & page hanging)
  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
 
    let iframe: HTMLIFrameElement | null = null;
    try {
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "800px";
      iframe.style.height = "1130px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
 
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");
 
      iframeDoc.open();
      iframeDoc.write(buildIsolatedHtml());
      iframeDoc.close();
 
      // Wait 250ms for fonts and layout to settle
      await new Promise((resolve) => setTimeout(resolve, 250));
 
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      });
 
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
 
      let heightLeft = imgHeight;
      let position = 0;
 
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
 
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
 
      pdf.save(`${cleanFilename}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      setIsExportingPdf(false);
    }
  };
 
  // 3. Direct Word (.doc) File Download
  const handleDownloadDoc = () => {
    try {
      setIsExportingDoc(true);
      const htmlContent = buildIsolatedHtml();
 
      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword;charset=utf-8",
      });
 
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cleanFilename}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setIsExportingDoc(false);
    }
  };
 
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Top Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="h-4 w-4 text-primary" />
          <span>Formal Document View</span>
        </div>
 
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy Text</span>
              </>
            )}
          </button>
 
          {/* Download Word Document Button */}
         
 
          {/* Download Clean PDF Button */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>
 
      {/* Screen Preview Container */}
      <div className="relative mx-auto min-h-[1050px] w-full max-w-[850px] rounded-lg border border-border/80 bg-white p-8 text-neutral-900 shadow-xl sm:p-14 md:p-16 dark:border-neutral-800 dark:bg-white dark:text-neutral-900">
        <div className="pointer-events-none absolute bottom-0 left-10 top-0 hidden w-px bg-red-500/20 sm:block" />
 
        <div className="relative font-serif leading-relaxed sm:pl-8">
          <div className="border-b-2 border-neutral-900 pb-5 text-center">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              In The Relevant Court Of Law / Official Legal Instrument
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold uppercase tracking-wide text-neutral-900">
              {docTitle}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-3 font-sans text-xs text-neutral-500">
              <span>Ref: {docNumber}</span>
              <span>•</span>
              <span>Version: {version}</span>
              <span>•</span>
              <span>Date: {executionDate}</span>
            </div>
          </div>
 
          {formattedContent ? (
            <div className="mt-8 space-y-4 text-[14px] leading-relaxed text-neutral-900 sm:text-[15px]">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h2 className="mb-4 mt-8 border-b border-neutral-300 pb-1.5 text-center font-serif text-lg font-bold uppercase tracking-wider text-neutral-900">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="mb-3 mt-8 border-b border-neutral-200 pb-1 font-serif text-base font-bold uppercase text-neutral-900">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="mb-2 mt-5 font-serif text-sm font-bold uppercase tracking-wide text-neutral-800">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <div className="mb-3 text-justify leading-7 text-neutral-800">
                      {children}
                    </div>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-neutral-950">{children}</strong>
                  ),
                  ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>,
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                }}
              >
                {formattedContent}
              </ReactMarkdown>
            </div>
          ) : null}
 
          {/* Structured Clauses */}
          {doc && doc.clauses && doc.clauses.length > 0 && (
            <div className="mt-8 space-y-5 text-[14px] sm:text-[15px]">
              {doc.clauses.map((clause, idx) => (
                <div key={idx} className="space-y-1 text-justify">
                  <h3 className="font-serif text-sm font-bold uppercase text-neutral-900">
                    {clause.number}. {clause.heading}
                  </h3>
                  <p className="leading-7 text-neutral-800">{clause.body}</p>
                </div>
              ))}
            </div>
          )}
 
          {/* Verification & Signature Section */}
          <div className="mt-16 border-t border-dashed border-neutral-300 pt-8">
            <div className="flex flex-col justify-between gap-12 sm:flex-row sm:items-end">
              <div className="space-y-1 text-xs">
                <p className="font-sans font-semibold">VERIFICATION:</p>
                <p className="max-w-xs text-neutral-600">
                  Verified that the contents of this instrument are true to my knowledge and belief.
                </p>
              </div>
 
              <div className="text-right text-xs">
                <div className="mb-6 border-b border-dashed border-neutral-400 pb-2 text-center text-neutral-400">
                  (Signature / Thumb Impression)
                </div>
                <p className="font-semibold uppercase text-neutral-900">
                  Deponent / Applicant / Executant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LegalDocument;