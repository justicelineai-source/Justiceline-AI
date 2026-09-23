export type FormFieldItem = {
  id: string;
  label: string;
  value: string; // Left clean/empty for user entry
  placeholder: string;
  required: boolean;
  isParagraph?: boolean;
  rawPattern?: string; // Stored to accurately replace within the document
};
 
export type FormStep = {
  id: number;
  title: string;
  description: string;
  fields: FormFieldItem[];
};
 
export const CANONICAL_STEPS: Array<{ title: string; desc: string; keywords: RegExp }> = [
  {
    title: "Parties & Forum",
    desc: "Court name, notice sender, recipient, petitioner, respondent, or party details",
    keywords: /(party|parties|court|forum|applicant|petitioner|respondent|sender|recipient|noticee|issuer|seller|buyer|deponent|lessor|lessee|plaintiff|defendant)/i,
  },
  {
    title: "Subject Matter",
    desc: "Subject heading, property details, factual background, or dispute summary",
    keywords: /(subject|property|schedule|fir|crime|premises|asset|dispute|matter|background|recital|facts)/i,
  },
  {
    title: "Grounds & Details",
    desc: "Primary grounds, specific requirements, cause of action, allegations, or breaches",
    keywords: /(ground|grievance|cause of action|allegation|reason|offence|provision|breach|incident|detail|term|event|facts)/i,
  },
  {
    title: "Terms & Prayer",
    desc: "Relief sought, demands, compliance period, or covenants",
    keywords: /(prayer|relief|claim|demand|compensation|consideration|covenant|condition|bail|undertaking|notice period|comply)/i,
  },
  {
    title: "Verification",
    desc: "Declaration, place, date, advocate signature, and attestation",
    keywords: /(verif|sign|witness|notary|execut|date|place|declaration|deponent|affirmation|advocate)/i,
  },
];
 
function cleanMarkdownArtifacts(str: string): string {
  return str
    .replace(/[*_`#]/g, "")
    .replace(/^[:\s—–-]+/, "")
    .replace(/[:\s—–-]+$/, "")
    .trim();
}
 
/**
 * Normalizes draft markdown headers and separates stacked label items
 */
export function normalizeDraftMarkdown(markdown: string): string {
  if (!markdown) return "";
 
  let cleaned = markdown.replace(/\r\n/g, "\n");
 
  // Format headers like "**1. Parties**" into standard "## 1. Parties"
  cleaned = cleaned.replace(/^(\*{0,2})(\d+\.\s+[A-Za-z\s/&-]+)(\*{0,2})$/gm, "\n## $2\n");
  cleaned = cleaned.replace(/^(\*{0,2})((?:Sender|Recipient|Notice Issuer|Noticee|Vendor|Purchaser)[^:\n]+)(\*{0,2})$/gm, "\n### $2\n");
 
  // Separate inline multiple bold tags
  cleaned = cleaned.replace(/([^\n])\s+(\*\*[A-Za-z0-9\s/(),.-]+:\*\*)/g, "$1\n$2");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
 
  return cleaned.trim();
}
 
/**
 * Parses individual line into a field
 */
export function parseDraftLine(raw: string): FormFieldItem | null {
  const line = raw.trim();
 
  if (!line || /^[-*_]{3,}$/.test(line) || /^#+/.test(line)) return null;
  if (/^(please provide|you may write|current information|complete the grouped|note:|please note|step \d)/i.test(cleanMarkdownArtifacts(line))) {
    return null;
  }
 
  const isRequired = /\(REQUIRED\)|REQUIRED/i.test(line);
  let cleanedLine = line.replace(/^(\*|-|\+|\d+[\.\)])\s*/, "").trim();
  cleanedLine = cleanedLine.replace(/\*?\*?\(?(REQUIRED\vert{}OPTIONAL)\)?\*?\*?/gi, "").trim();
 
  let fieldLabel = "";
  let existingVal = "";
  let isParagraph = false;
 
  const bracketMatch = cleanedLine.match(/^\[(Text\s*Input\vert{}Textarea\vert{}Dropdown\vert{}Number\s*Input\vert{}Date\s*Picker\vert{}Checkbox)?\s*:?\s*([^\]]+)\](.*)$/i);
  const boldMatch = cleanedLine.match(/^\*\*([^*:]+)\*\*[:\s—–-]*(.*)$/);
 
  if (bracketMatch) {
    const controlType = (bracketMatch[1] || "").toLowerCase();
    fieldLabel = bracketMatch[2].trim();
    existingVal = (bracketMatch[3] || "").trim();
    if (controlType.includes("area")) isParagraph = true;
  } else if (boldMatch) {
    fieldLabel = boldMatch[1].trim();
    existingVal = (boldMatch[2] || "").trim();
  } else if (cleanedLine.includes(":") && cleanedLine.indexOf(":") < 60) {
    const colonIdx = cleanedLine.indexOf(":");
    fieldLabel = cleanedLine.slice(0, colonIdx).trim();
    existingVal = cleanedLine.slice(colonIdx + 1).trim();
  } else {
    return null;
  }
 
  // Remove all asterisks, brackets, and markdown artifacts from label
  fieldLabel = cleanMarkdownArtifacts(fieldLabel)
    .replace(/^(Text\s*Input|Dropdown|Textarea|Number\s*Input|Date\s*Picker|Checkbox)[:\s]*/i, "")
    .trim();
 
  if (!fieldLabel || /^(select|status|required|optional|details)$/i.test(fieldLabel) || fieldLabel.length > 70) {
    return null;
  }
 
  // Thoroughly clean any existing text so it does not contain ** or markdown symbols
  existingVal = cleanMarkdownArtifacts(existingVal);
  if (/^[._\s]{3,}$/.test(existingVal)) existingVal = "";
 
  fieldLabel = fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);
 
  return {
    id: "",
    label: fieldLabel,
    value: "", // Always start with a completely empty, clean field
    placeholder: existingVal ? existingVal : `Enter ${fieldLabel.toLowerCase()}...`,
    required: isRequired,
    isParagraph: isParagraph || fieldLabel.toLowerCase().includes("address") || fieldLabel.toLowerCase().includes("details") || fieldLabel.toLowerCase().includes("facts"),
    rawPattern: raw,
  };
}
 
/**
 * Splits document by section headings and parses both structured fields and paragraph blocks.
 */
export function parseMarkdownToFormSteps(markdown: string): FormStep[] {
  const normalized = normalizeDraftMarkdown(markdown);
  const steps: FormStep[] = CANONICAL_STEPS.map((s, idx) => ({
    id: idx + 1,
    title: s.title,
    description: s.desc,
    fields: [],
  }));
 
  if (!normalized) return steps;
 
  // Split content by major markdown headings
  const sectionChunks = normalized.split(/\n(?=##?\s+)/);
  let counter = 1;
 
  sectionChunks.forEach((chunk) => {
    const lines = chunk.split("\n");
    const headingLine = lines[0].trim();
    const bodyLines = lines.slice(1);
 
    // Route section into matching canonical step
    let targetStepIdx = CANONICAL_STEPS.findIndex((s) => s.keywords.test(headingLine));
    if (targetStepIdx === -1) {
      targetStepIdx = 1; // Default to Subject / Background
    }
 
    let parsedFieldsInChunk = 0;
    const unparsedParagraphs: string[] = [];
 
    bodyLines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
 
      const field = parseDraftLine(rawLine);
      if (field) {
        steps[targetStepIdx].fields.push({
          ...field,
          id: `field_${counter++}`,
        });
        parsedFieldsInChunk++;
      } else {
        // Collect narrative text, clauses, or recitals
        if (!line.startsWith("#") && !/^(please provide|you may write)/i.test(cleanMarkdownArtifacts(line))) {
          unparsedParagraphs.push(line);
        }
      }
    });
 
    // If a section (like Grounds or Prayer) has long legal prose rather than key-value items,
    // add an editable section textarea so it is never shown as empty.
    if (parsedFieldsInChunk === 0 && unparsedParagraphs.length > 0) {
      const sectionText = unparsedParagraphs.join("\n\n");
      steps[targetStepIdx].fields.push({
        id: `field_section_${counter++}`,
        label: `${steps[targetStepIdx].title} Content / Clauses`,
        value: "",
        placeholder: sectionText.length > 120 ? sectionText.slice(0, 120) + "..." : sectionText,
        required: false,
        isParagraph: true,
        rawPattern: sectionText,
      });
    }
  });
 
  // Guarantee every step has at least one editable input area
  steps.forEach((st, idx) => {
    if (st.fields.length === 0) {
      st.fields.push({
        id: `field_fallback_${idx + 1}`,
        label: `${st.title} Statements`,
        value: "",
        placeholder: `Enter ${st.title.toLowerCase()} details or covenants...`,
        required: false,
        isParagraph: true,
      });
    }
  });
 
  return steps;
}
 
/**
 * Updates draft with user entries without removing existing headings or unedited clauses.
 */
export function compileFormStepsToMarkdown(
  title: string,
  steps: FormStep[],
  originalMarkdown: string
): string {
  let updatedMarkdown = normalizeDraftMarkdown(originalMarkdown);
 
  if (title && title.trim()) {
    if (/^#\s+.+/m.test(updatedMarkdown)) {
      updatedMarkdown = updatedMarkdown.replace(/^#\s+.+/m, `# ${title.trim()}`);
    } else {
      updatedMarkdown = `# ${title.trim()}\n\n` + updatedMarkdown;
    }
  }
 
  steps.forEach((step) => {
    step.fields.forEach((f) => {
      const userValue = f.value.trim();
      if (!userValue) return; // Unedited fields remain completely untouched
 
      if (f.rawPattern && updatedMarkdown.includes(f.rawPattern)) {
        const replacement = f.isParagraph
          ? `\n**${f.label}**:\n${userValue}\n`
          : `**${f.label}**: ${userValue}`;
 
        updatedMarkdown = updatedMarkdown.replace(f.rawPattern, replacement);
        f.rawPattern = replacement;
      } else {
        // If it was a new field appended to an existing step, append under that step heading
        const stepHeaderRegex = new RegExp(`(##?\\s+.*${step.title}.*)`, "i");
        if (stepHeaderRegex.test(updatedMarkdown)) {
          const addition = f.isParagraph
            ? `\n\n**${f.label}**:\n${userValue}\n`
            : `\n\n**${f.label}**: ${userValue}`;
          updatedMarkdown = updatedMarkdown.replace(stepHeaderRegex, `$1${addition}`);
        }
      }
    });
  });
 
  return updatedMarkdown;
}
 