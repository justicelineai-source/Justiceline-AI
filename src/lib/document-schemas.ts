export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "select" | "file";
  placeholder?: string;
  options?: string[];
  fullWidth?: boolean;
};
 
export type StepConfig = {
  id: number;
  title: string;
  description: string;
  fields: FieldConfig[];
};
 
export type DocumentConfig = {
  slug: string;
  title: string;
  category: string;
  steps: StepConfig[];
};
 
export const DOCUMENT_SCHEMAS: Record<string, DocumentConfig> = {
  "sale-deed": {
    slug: "sale-deed",
    title: "Sale Deed",
    category: "Property Documents",
    steps: [
      {
        id: 1,
        title: "Seller",
        description: "Seller identification and contact details",
        fields: [
          { name: "sellerName", label: "Seller Full Name", placeholder: "Rajesh Kumar Sharma" },
          { name: "sellerPhone", label: "Phone Number", placeholder: "+91 98765 43210" },
          { name: "sellerEmail", label: "Email Address", type: "email", placeholder: "rajesh@example.com" },
          { name: "sellerAddress", label: "Full Address", fullWidth: true, placeholder: "Street, City, State, Pincode" },
        ],
      },
      {
        id: 2,
        title: "Buyer",
        description: "Buyer identification and contact details",
        fields: [
          { name: "buyerName", label: "Buyer Full Name", placeholder: "Priya Mehta" },
          { name: "buyerPhone", label: "Phone Number", placeholder: "+91 98765 43210" },
          { name: "buyerEmail", label: "Email Address", type: "email", placeholder: "priya@example.com" },
          { name: "buyerAddress", label: "Full Address", fullWidth: true, placeholder: "Street, City, State, Pincode" },
        ],
      },
      {
        id: 3,
        title: "Property",
        description: "Legal identification of real estate property",
        fields: [
          { name: "propertyType", label: "Property Type", type: "select", options: ["Residential Plot", "Agricultural Land", "Apartment / Flat", "Commercial Property"] },
          { name: "surveyNumber", label: "Survey / Plot Number", placeholder: "Survey No. 142/2A" },
          { name: "propertyAddress", label: "Property Address", fullWidth: true, placeholder: "Address with landmarks" },
          { name: "district", label: "District", placeholder: "Hyderabad" },
          { name: "propertyArea", label: "Property Area (sq. ft.)", placeholder: "2400" },
        ],
      },
      {
        id: 4,
        title: "Sale",
        description: "Financial terms and consideration amount",
        fields: [
          { name: "saleAmount", label: "Total Sale Amount (₹)", placeholder: "1,25,00,000" },
          { name: "advanceAmount", label: "Advance Paid (₹)", placeholder: "25,00,000" },
          { name: "paymentMethod", label: "Payment Method", type: "select", options: ["Bank Transfer (NEFT/RTGS)", "Demand Draft", "Cheque"] },
          { name: "dateOfSale", label: "Date of Sale", type: "date" },
        ],
      },
      {
        id: 5,
        title: "Registration",
        description: "Sub-registrar office registration and execution declaration",
        fields: [
          { name: "subRegistrar", label: "Sub-Registrar Office", placeholder: "SRO Ranga Reddy" },
          { name: "registrationDate", label: "Registration Date", type: "date" },
        ],
      },
    ],
  },
  "rental-agreement": {
    slug: "rental-agreement",
    title: "Rental Agreement",
    category: "Property Documents",
    steps: [
      {
        id: 1,
        title: "Landlord",
        description: "Property owner details",
        fields: [
          { name: "landlordName", label: "Landlord Full Name", placeholder: "Suresh Rao" },
          { name: "landlordPhone", label: "Phone Number", placeholder: "+91 98765 43210" },
          { name: "landlordAddress", label: "Permanent Address", fullWidth: true, placeholder: "Current home address" },
        ],
      },
      {
        id: 2,
        title: "Tenant",
        description: "Tenant details",
        fields: [
          { name: "tenantName", label: "Tenant Full Name", placeholder: "Ananya Roy" },
          { name: "tenantPhone", label: "Phone Number", placeholder: "+91 98765 11223" },
          { name: "tenantEmail", label: "Email Address", type: "email", placeholder: "tenant@example.com" },
        ],
      },
      {
        id: 3,
        title: "Premises",
        description: "Rented property address and specifications",
        fields: [
          { name: "premisesAddress", label: "Rented Premises Address", fullWidth: true, placeholder: "Flat No, Building, Street" },
          { name: "fixtures", label: "Fittings & Fixtures Included", placeholder: "2 Fans, 1 AC, Geyser" },
        ],
      },
      {
        id: 4,
        title: "Terms",
        description: "Rent, deposit, and lock-in period",
        fields: [
          { name: "monthlyRent", label: "Monthly Rent (₹)", placeholder: "25,000" },
          { name: "securityDeposit", label: "Security Deposit (₹)", placeholder: "1,00,000" },
          { name: "leaseDuration", label: "Lease Period (Months)", placeholder: "11 Months" },
          { name: "startDate", label: "Commencement Date", type: "date" },
        ],
      },
      {
        id: 5,
        title: "Execution",
        description: "Lock-in and declaration",
        fields: [
          { name: "noticePeriod", label: "Notice Period", placeholder: "1 Month" },
          { name: "executionDate", label: "Agreement Date", type: "date" },
        ],
      },
    ],
  },
  "affidavit": {
    slug: "affidavit",
    title: "Affidavit",
    category: "Court Documents",
    steps: [
      {
        id: 1,
        title: "Deponent",
        description: "Person sworn to the affidavit",
        fields: [
          { name: "deponentName", label: "Full Name", placeholder: "Arun Sharma" },
          { name: "fatherName", label: "Father / Husband's Name", placeholder: "M. K. Sharma" },
          { name: "age", label: "Age", placeholder: "35" },
          { name: "address", label: "Residential Address", fullWidth: true, placeholder: "Full permanent address" },
        ],
      },
      {
        id: 2,
        title: "Purpose",
        description: "Reason and authority",
        fields: [
          { name: "purpose", label: "Affidavit Purpose", placeholder: "Name Change / Address Proof / Court Declaration" },
          { name: "authority", label: "Authority / Court Submitted To", placeholder: "Passport Office / Civil Court" },
        ],
      },
      {
        id: 3,
        title: "Statements",
        description: "Facts affirmed under oath",
        fields: [
          { name: "fact1", label: "Affirmation Statement 1", fullWidth: true, placeholder: "That I am a citizen of India residing at..." },
          { name: "fact2", label: "Affirmation Statement 2", fullWidth: true, placeholder: "That the particulars stated above are true..." },
        ],
      },
      {
        id: 4,
        title: "Verification",
        description: "Oath and place of signing",
        fields: [
          { name: "place", label: "Place of Oath", placeholder: "New Delhi" },
          { name: "date", label: "Date of Oath", type: "date" },
        ],
      },
      {
        id: 5,
        title: "Notary",
        description: "Attestation details",
        fields: [
          { name: "notaryAdvocate", label: "Notary / Advocate Name", placeholder: "Adv. V. K. Gupta" },
        ],
      },
    ],
  },
};
 
// Fallback configuration for any other document clicked
export function getDefaultSchema(slug: string): DocumentConfig {
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
 
  return (
    DOCUMENT_SCHEMAS[slug] ?? {
      slug,
      title: formattedTitle,
      category: "Legal Document",
      steps: [
        {
          id: 1,
          title: "First Party",
          description: "Primary party details",
          fields: [
            { name: "party1Name", label: "Full Name / Organization", placeholder: "First Party Name" },
            { name: "party1Phone", label: "Contact Phone", placeholder: "+91 98765 00000" },
            { name: "party1Address", label: "Address", fullWidth: true, placeholder: "Full Address" },
          ],
        },
        {
          id: 2,
          title: "Second Party",
          description: "Opposite party details",
          fields: [
            { name: "party2Name", label: "Full Name / Organization", placeholder: "Second Party Name" },
            { name: "party2Phone", label: "Contact Phone", placeholder: "+91 98765 11111" },
            { name: "party2Address", label: "Address", fullWidth: true, placeholder: "Full Address" },
          ],
        },
        {
          id: 3,
          title: "Subject Matter",
          description: "Core facts and context",
          fields: [
            { name: "subjectSummary", label: "Brief Summary", fullWidth: true, placeholder: "Context of this agreement/deed" },
            { name: "jurisdiction", label: "Jurisdiction / City", placeholder: "Mumbai" },
          ],
        },
        {
          id: 4,
          title: "Terms",
          description: "Clauses and commercial consideration",
          fields: [
            { name: "consideration", label: "Consideration Amount (₹)", placeholder: "0.00 if non-financial" },
            { name: "effectiveDate", label: "Effective Date", type: "date" },
          ],
        },
        {
          id: 5,
          title: "Execution",
          description: "Review & Sign",
          fields: [
            { name: "witnessName", label: "Primary Witness Name", placeholder: "Witness Name" },
          ],
        },
      ],
    }
  );
}