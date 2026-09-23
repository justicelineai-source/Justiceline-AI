export type LegalDoc = {
  title: string;
  documentNumber: string;
  version: string;
  executionDate: string;
  parties: { role: string; name: string; details: string }[];
  recitals: string[];
  clauses: { number: string; heading: string; body: string }[];
};
 
export function buildDoc(slug: string, data: Record<string, string>): LegalDoc {
  const date = data.dateOfSale || data.startDate || data.date || new Date().toLocaleDateString("en-IN");
  const docNum = `JL-${Math.floor(100000 + Math.random() * 900000)}`;
 
  const parties = [];
  if (data.sellerName) parties.push({ role: "VENDOR / SELLER", name: data.sellerName, details: `${data.sellerAddress || ""} | Ph: ${data.sellerPhone || ""}` });
  if (data.buyerName) parties.push({ role: "PURCHASER / BUYER", name: data.buyerName, details: `${data.buyerAddress || ""} | Ph: ${data.buyerPhone || ""}` });
  if (data.landlordName) parties.push({ role: "LESSOR / LANDLORD", name: data.landlordName, details: data.landlordAddress || "" });
  if (data.tenantName) parties.push({ role: "LESSEE / TENANT", name: data.tenantName, details: data.tenantPhone || "" });
  if (data.deponentName) parties.push({ role: "DEPONENT", name: data.deponentName, details: `Age: ${data.age || "Major"}, Residing at ${data.address || ""}` });
  if (data.party1Name) parties.push({ role: "FIRST PARTY", name: data.party1Name, details: data.party1Address || "" });
  if (data.party2Name) parties.push({ role: "SECOND PARTY", name: data.party2Name, details: data.party2Address || "" });
 
  // Generate dynamic legal clauses from the user input
  const clauses = [
    {
      number: "1",
      heading: "CONSIDERATION & PAYMENT",
      body: `The total agreed consideration is ₹${data.saleAmount || data.monthlyRent || data.consideration || "NIL"}, receipt of which is hereby acknowledged according to the covenants set forth.`,
    },
    {
      number: "2",
      heading: "PROPERTY / SUBJECT DESCRIPTION",
      body: data.propertyAddress || data.premisesAddress || data.subjectSummary || "As described in the schedule herein.",
    },
    {
      number: "3",
      heading: "STATUTORY COVENANTS",
      body: "The parties agree that all duties, statutory obligations, and title verifications have been conducted lawfully with full disclosure.",
    },
    {
      number: "4",
      heading: "JURISDICTION & GOVERNING LAW",
      body: `This instrument shall be governed in accordance with the laws of India and subject to the exclusive jurisdiction of the courts at ${data.district || data.jurisdiction || "competent jurisdiction"}.`,
    },
  ];
 
  return {
    title: slug.replace(/-/g, " ").toUpperCase(),
    documentNumber: docNum,
    version: "1.0",
    executionDate: date,
    parties,
    recitals: [
      "WHEREAS the parties have mutually discussed and agreed to execute this formal instrument.",
      "WHEREAS the transfer/agreement is executed without any fraud, coercion, or undue influence.",
    ],
    clauses,
  };
}
 
export function docToPlainText(doc: LegalDoc): string {
  let text = `${doc.title}\nDoc Ref: ${doc.documentNumber} | Date: ${doc.executionDate}\n\n`;
  text += "PARTIES:\n";
  doc.parties.forEach((p) => {
    text += `${p.role}: ${p.name} (${p.details})\n`;
  });
  text += "\nRECITALS:\n";
  doc.recitals.forEach((r) => {
    text += `- ${r}\n`;
  });
  text += "\nTERMS AND CONDITIONS:\n";
  doc.clauses.forEach((c) => {
    text += `${c.number}. ${c.heading}\n${c.body}\n\n`;
  });
  return text;
}
 
export function docToWordHtml(doc: LegalDoc): string {
  return `
    <html>
      <head><meta charset="utf-8"><title>${doc.title}</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 30px;">
        <h1 style="text-align: center;">${doc.title}</h1>
        <p style="text-align: center; color: #666;">Ref: ${doc.documentNumber} | Date: ${doc.executionDate}</p>
        <hr/>
        <h3>PARTIES</h3>
        ${doc.parties.map((p) => `<p><strong>${p.role}:</strong> ${p.name} (${p.details})</p>`).join("")}
        <h3>TERMS</h3>
        ${doc.clauses.map((c) => `<p><strong>${c.number}. ${c.heading}</strong><br/>${c.body}</p>`).join("")}
      </body>
    </html>
  `;
}
 