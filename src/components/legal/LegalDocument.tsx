import type { LegalDoc, DocSection } from "@/lib/legal-templates";

/**
 * Renders an authentic-looking Indian legal document on A4 paper with:
 * - Serif typography, justified paragraphs, indented legal numbering
 * - Diagonal watermark, official header + footer, page numbers
 * - Print-friendly (see @media print in styles.css)
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="legal-document mx-auto max-w-[820px] print:max-w-none">
      <article
        id="legal-doc-print-root"
        className="legal-paper relative overflow-hidden bg-white text-[13.5px] leading-[1.85] text-neutral-900 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] print:shadow-none"
        style={{
          fontFamily: '"Libre Baskerville", "Georgia", "Times New Roman", serif',
          padding: "72px 78px 90px",
          minHeight: "1123px",
          border: "1px solid #d9d3c4",
        }}
      >
        {/* Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none"
        >
          <span
            style={{
              transform: "rotate(-28deg)",
              fontSize: "128px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              color: "rgba(106, 27, 26, 0.06)",
              whiteSpace: "nowrap",
              fontFamily: '"Georgia", serif',
            }}
          >
            JUSTICELINE • DRAFT
          </span>
        </div>

        {/* Header */}
        <header
          className="relative z-10 mb-6 border-b-2 pb-4"
          style={{ borderColor: "#6A1B1A" }}
        >
          <div className="flex items-start justify-between gap-4 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "#6A1B1A" }}>
            <div>
              <div className="font-bold">JusticeLine AI</div>
              <div className="text-[9.5px] font-medium text-neutral-500 normal-case tracking-normal">Generated Legal Draft</div>
            </div>
            <div className="text-right text-[9.5px] text-neutral-600 normal-case tracking-normal leading-5">
              <div><b>Doc No.:</b> {doc.documentNumber}</div>
              {doc.registrationNumber && <div><b>Reg.:</b> {doc.registrationNumber}</div>}
              <div><b>Version:</b> {doc.version} · <b>Status:</b> {doc.status}</div>
              <div><b>Date:</b> {doc.executionDate} · <b>Place:</b> {doc.place}</div>
            </div>
          </div>
          <div className="mt-2 text-[9.5px] text-neutral-500">
            <b>Jurisdiction:</b> {doc.jurisdiction} · <b>Applicable Act:</b> {doc.applicableAct}
            {doc.applicableRules && <> · <b>Rules:</b> {doc.applicableRules}</>}
          </div>
        </header>

        {/* Title */}
        <div className="relative z-10 mb-8 text-center">
          <h1
            className="font-bold uppercase"
            style={{
              fontFamily: '"Libre Baskerville", "Georgia", serif',
              fontSize: "30px",
              letterSpacing: "0.14em",
              textDecoration: "underline",
              textUnderlineOffset: "10px",
              textDecorationThickness: "1px",
            }}
          >
            {doc.title}
          </h1>
          {doc.subtitle && (
            <p className="mt-3 text-[11.5px] italic text-neutral-600">{doc.subtitle}</p>
          )}
        </div>

        {/* Body */}
        <div className="relative z-10 space-y-4 text-justify" style={{ hyphens: "auto" }}>
          {doc.sections.map((s, i) => (
            <SectionRenderer key={i} section={s} />
          ))}
        </div>

        {/* Attestation footer */}
        <div className="relative z-10 mt-14 text-[10px] text-neutral-500">
          <div className="border-t border-neutral-300 pt-3 text-center">
            This document has been prepared by <b>{doc.preparedBy}</b> based on user-supplied details and is intended
            for review by a qualified legal practitioner prior to execution or filing. Draft output does not constitute legal advice.
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Prepared by {doc.preparedBy} · {doc.executionDate}</span>
            <span className="page-number">Page 1 of 1</span>
          </div>
        </div>
      </article>
    </div>
  );
}

function SectionRenderer({ section }: { section: DocSection }) {
  if (section.kind === "para") {
    return (
      <p
        className="whitespace-pre-line"
        style={{
          textAlign: section.align || "justify",
          textIndent: section.align === "center" || section.align === "left" ? 0 : "2em",
        }}
      >
        {section.text}
      </p>
    );
  }
  if (section.kind === "heading") {
    return (
      <h2
        className="mt-6 mb-2 text-center font-bold uppercase"
        style={{
          fontSize: section.level === 3 ? "13px" : "15px",
          letterSpacing: "0.1em",
          fontFamily: '"Libre Baskerville", "Georgia", serif',
        }}
      >
        {section.text}
      </h2>
    );
  }
  if (section.kind === "list") {
    const Tag = section.ordered ? "ol" : "ul";
    return (
      <Tag
        className={section.ordered ? "list-decimal" : "list-disc"}
        style={{ paddingLeft: "2.5em", textAlign: "justify" }}
      >
        {section.items.map((it, i) => (
          <li key={i} className="mb-2 pl-1">{it}</li>
        ))}
      </Tag>
    );
  }
  if (section.kind === "block") {
    return (
      <div
        className="my-3 rounded-sm border p-4 text-[12.5px]"
        style={{ borderColor: "#c9c1ad", background: "rgba(184,134,11,0.04)", textAlign: "justify" }}
      >
        {section.label && <div className="mb-1 font-bold uppercase tracking-wider text-[11px]" style={{ color: "#6A1B1A" }}>{section.label}</div>}
        {section.text}
      </div>
    );
  }
  if (section.kind === "sig") {
    return (
      <div className="mt-10 grid gap-8" style={{ gridTemplateColumns: `repeat(${section.parties.length}, minmax(0,1fr))` }}>
        {section.parties.map((p) => (
          <div key={p.role} className="text-center">
            <div className="h-14 border-b border-neutral-800" />
            <div className="mt-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "#6A1B1A" }}>{p.role}</div>
            <div className="text-[12px]">{p.name}</div>
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === "witnesses") {
    return (
      <div className="mt-8 grid grid-cols-2 gap-8">
        {["WITNESS 1", "WITNESS 2"].map((w) => (
          <div key={w}>
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#6A1B1A" }}>{w}</div>
            <div className="mt-8 border-b border-neutral-800" />
            <div className="mt-1 text-[10.5px] text-neutral-500">Name, Address & Signature</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
