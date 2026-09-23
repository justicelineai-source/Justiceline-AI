// Rich Indian legal document content generators. Each returns structured
// sections that render into an authentic-looking court/registry document.

import type { DraftFormData } from "./drafts-store";

export type DocSection =
  | { kind: "para"; text: string; align?: "left" | "center" | "justify" }
  | { kind: "heading"; text: string; level?: 2 | 3 }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "block"; label?: string; text: string } // boxed/indented block
  | { kind: "sig"; parties: { role: string; name: string }[] }
  | { kind: "witnesses" };

export type LegalDoc = {
  title: string;              // e.g. SALE DEED
  subtitle?: string;          // e.g. Registered under Registration Act, 1908
  jurisdiction: string;       // e.g. State of Telangana
  applicableAct: string;      // e.g. Transfer of Property Act, 1882
  applicableRules?: string;
  place: string;
  executionDate: string;
  documentNumber: string;
  registrationNumber?: string;
  version: number;
  preparedBy: string;
  status: "Draft" | "Reviewed" | "Final";
  sections: DocSection[];
};

const val = (d: DraftFormData, k: string, fb: string) =>
  (d[k] as string | undefined)?.toString().trim() || fb;

const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

const docNo = (slug: string) => {
  const yr = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `JL/${slug.toUpperCase().slice(0, 4)}/${yr}/${rand}`;
};

// --- Specific rich templates for high-signal documents -----------------------

function saleDeed(d: DraftFormData): LegalDoc {
  const seller = val(d, "sellerName", "Sri Rajesh Kumar Sharma");
  const buyer = val(d, "buyerName", "Smt. Priya Mehta");
  const amount = val(d, "saleAmount", "1,25,00,000");
  const advance = val(d, "advanceAmount", "25,00,000");
  const village = val(d, "village", "Jubilee Hills");
  const district = val(d, "district", "Ranga Reddy");
  const state = val(d, "state", "Telangana");
  const pincode = val(d, "pincode", "500033");
  const survey = val(d, "surveyNumber", "142/2A");
  const area = val(d, "propertyArea", "2400");
  const propertyAddress = val(d, "propertyAddress", "Plot No. 7, Road No. 4, Jubilee Hills");
  const dateOfSale = val(d, "dateOfSale", today());
  const subRegistrar = val(d, "subRegistrar", "SRO Ranga Reddy");

  return {
    title: "SALE DEED",
    subtitle: "Executed and Registered under the Registration Act, 1908",
    jurisdiction: `${district}, State of ${state}`,
    applicableAct: "Transfer of Property Act, 1882 & Registration Act, 1908",
    applicableRules: `Indian Stamp Act, 1899 (as applicable in ${state})`,
    place: `${village}, ${district}, ${state}`,
    executionDate: dateOfSale,
    documentNumber: docNo("SD"),
    registrationNumber: `Doc. No. ____/${new Date().getFullYear()}, ${subRegistrar}`,
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `THIS DEED OF ABSOLUTE SALE is made and executed on this ${dateOfSale} at ${village}, ${district}, ${state}, BETWEEN:` },
      { kind: "block", label: "VENDOR",
        text: `${seller}, aged about ___ years, Indian Inhabitant, residing at ${val(d, "sellerAddress", "____________________________")}, hereinafter referred to as the "VENDOR" (which expression shall, unless repugnant to the context or meaning thereof, mean and include his heirs, legal representatives, executors, administrators, successors and assigns) of the ONE PART;` },
      { kind: "para", align: "center", text: "AND" },
      { kind: "block", label: "PURCHASER",
        text: `${buyer}, aged about ___ years, Indian Inhabitant, residing at ${val(d, "buyerAddress", "____________________________")}, hereinafter referred to as the "PURCHASER" (which expression shall, unless repugnant to the context or meaning thereof, mean and include her heirs, legal representatives, executors, administrators, successors and assigns) of the OTHER PART.` },
      { kind: "heading", text: "WHEREAS:" },
      { kind: "list", ordered: true, items: [
        `The Vendor is the sole and absolute owner in peaceful possession and enjoyment of the immovable property more particularly described in the Schedule hereunder written (hereinafter referred to as "the Schedule Property"), having acquired the same by way of a registered document duly registered before the office of the Sub-Registrar, ${district}.`,
        `The Schedule Property is free from all encumbrances, mortgages, charges, liens, litigations, attachments, acquisition proceedings, tenancy rights or claims of any nature whatsoever, and the Vendor has an absolute, clear and marketable title thereto.`,
        `The Vendor being desirous of selling the Schedule Property and the Purchaser being desirous of purchasing the same, the parties have mutually agreed for the sale and purchase of the Schedule Property for a total sale consideration of ₹${amount}/- (Rupees ${amount} only), the receipt whereof is hereinafter acknowledged.`,
        `The Purchaser has paid an advance amount of ₹${advance}/- vide banking channel, and the balance sale consideration has been paid at the time of execution of these presents.`,
      ]},
      { kind: "heading", text: "NOW THIS DEED WITNESSETH AS UNDER:" },
      { kind: "list", ordered: true, items: [
        `In consideration of the total sum of ₹${amount}/- (Rupees ${amount} only) received in full by the Vendor from the Purchaser in the manner herein above stated (the receipt whereof the Vendor doth hereby admit and acknowledge), the Vendor doth hereby GRANT, CONVEY, TRANSFER, ASSIGN and ASSURE unto the Purchaser ALL THAT the Schedule Property TO HAVE AND TO HOLD the same absolutely and forever.`,
        `The Vendor hereby covenants with the Purchaser that the Vendor has good right, full power and absolute authority to sell, convey and transfer the Schedule Property in the manner aforesaid.`,
        `The Vendor further covenants that the Purchaser shall henceforth peaceably and quietly enter upon, hold, possess and enjoy the Schedule Property without any let, hindrance, interruption, disturbance, claim or demand whatsoever from or by the Vendor or any person claiming through or under him.`,
        `The Vendor has this day delivered vacant, physical and khas possession of the Schedule Property together with all original title deeds, documents of title, revenue receipts and other papers in his possession relating to the Schedule Property to the Purchaser.`,
        `All statutory dues, taxes, cesses and outgoings in respect of the Schedule Property up to the date of execution of this Deed shall be borne and paid by the Vendor and thereafter by the Purchaser.`,
        `The Vendor hereby indemnifies and shall keep indemnified the Purchaser against any loss, damage, cost or expense that may be occasioned to the Purchaser on account of any defect in the title of the Vendor.`,
      ]},
      { kind: "heading", text: "SCHEDULE OF PROPERTY" },
      { kind: "block",
        text: `All that piece and parcel of immovable property bearing Survey No. ${survey}, admeasuring ${area} sq. ft., situated at ${propertyAddress}, ${village}, ${district} District, State of ${state} — ${pincode}, bounded as follows: North: Road / adjoining plot; South: Adjoining plot; East: Adjoining plot; West: Adjoining plot — together with all rights, easements, appurtenances and privileges thereto belonging.` },
      { kind: "para", align: "justify",
        text: `IN WITNESS WHEREOF, the Vendor and the Purchaser have hereunto set and subscribed their respective hands on the day, month and year first hereinabove written, in the presence of the witnesses attesting hereunder.` },
      { kind: "sig", parties: [
        { role: "VENDOR", name: seller },
        { role: "PURCHASER", name: buyer },
      ]},
      { kind: "witnesses" },
    ],
  };
}

function legalNotice(d: DraftFormData): LegalDoc {
  const sender = val(d, "sellerName", "M/s. Kapoor & Associates, Advocates");
  const noticee = val(d, "buyerName", "Mr. Anil Verma");
  const amount = val(d, "saleAmount", "4,20,000");
  return {
    title: "LEGAL NOTICE",
    subtitle: "Issued under Section 80 CPC / Section 138 NI Act (as applicable)",
    jurisdiction: "Territorial jurisdiction: District Court, New Delhi",
    applicableAct: "Negotiable Instruments Act, 1881 / Code of Civil Procedure, 1908",
    place: "New Delhi",
    executionDate: today(),
    documentNumber: docNo("LN"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "left", text: `Ref. No.: ${docNo("LN")}    Dated: ${today()}` },
      { kind: "para", align: "left", text: `To,\n${noticee}\n${val(d, "buyerAddress", "____________________________")}\n(hereinafter referred to as "the Noticee")` },
      { kind: "heading", text: "Sub: Legal Notice for recovery of dues and consequential action" },
      { kind: "para", align: "justify",
        text: `Under instructions from and on behalf of my client, ${sender}, having its office at ${val(d, "sellerAddress", "____________________________")} (hereinafter referred to as "my Client"), I have been instructed to serve upon you the following legal notice:` },
      { kind: "list", ordered: true, items: [
        `That my Client and yourself entered into commercial dealings during the course of which you became liable to pay to my Client a sum of ₹${amount}/- (Rupees ${amount} only) towards ${val(d, "propertyType", "goods supplied / services rendered")}.`,
        `That in discharge of the aforesaid liability, you issued a cheque bearing No. ______, dated ______, drawn on ______ Bank, ______ Branch, for a sum of ₹${amount}/-, in favour of my Client.`,
        `That upon presentation, the said cheque was returned unpaid by the drawee bank with the endorsement "Funds Insufficient" vide memo dated ______, thereby attracting the provisions of Section 138 of the Negotiable Instruments Act, 1881.`,
        `That despite repeated oral and written demands, you have failed and neglected to pay the said amount, thereby causing serious loss, inconvenience and mental agony to my Client.`,
      ]},
      { kind: "para", align: "justify",
        text: `Through this notice, you are hereby called upon to pay the aforesaid sum of ₹${amount}/- together with interest @ 18% p.a. within a period of fifteen (15) days from the receipt of this notice, failing which my Client shall be constrained to initiate appropriate civil and criminal proceedings against you, including under Section 138 of the Negotiable Instruments Act, 1881, entirely at your risk as to costs and consequences.` },
      { kind: "para", align: "justify",
        text: `A copy of this notice has been retained in my office for further necessary action.` },
      { kind: "sig", parties: [{ role: "ADVOCATE FOR THE COMPLAINANT", name: sender }] },
    ],
  };
}

function affidavit(d: DraftFormData): LegalDoc {
  const dep = val(d, "sellerName", "Sri Ramesh Kumar");
  return {
    title: "AFFIDAVIT",
    subtitle: "Sworn under the Oaths Act, 1969",
    jurisdiction: "Before the Notary Public / Oath Commissioner",
    applicableAct: "The Oaths Act, 1969 & Bharatiya Sakshya Adhiniyam, 2023",
    place: val(d, "state", "New Delhi"),
    executionDate: today(),
    documentNumber: docNo("AF"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "center", text: `[On Non-Judicial Stamp Paper of ₹10/-]` },
      { kind: "para", align: "justify",
        text: `I, ${dep}, S/o ____________________, aged about ___ years, Indian Inhabitant, residing at ${val(d, "sellerAddress", "____________________________")}, do hereby solemnly affirm and declare on oath as under:` },
      { kind: "list", ordered: true, items: [
        `That I am the deponent in the above-named affidavit and am well acquainted with the facts and circumstances of the case and competent to swear this affidavit.`,
        `That the contents of the accompanying application / petition have been read over and explained to me in vernacular, and the same are true and correct to the best of my knowledge, information and belief.`,
        `That no part of this affidavit is false and nothing material has been concealed therefrom.`,
        `That whatever is stated hereinabove is true and correct to the best of my knowledge and belief.`,
      ]},
      { kind: "heading", text: "VERIFICATION" },
      { kind: "para", align: "justify",
        text: `Verified at ${val(d, "state", "New Delhi")} on this ${today()} that the contents of the above affidavit are true and correct to the best of my knowledge, no part of it is false and nothing material has been concealed therefrom.` },
      { kind: "sig", parties: [{ role: "DEPONENT", name: dep }] },
    ],
  };
}

function powerOfAttorney(d: DraftFormData): LegalDoc {
  const executant = val(d, "sellerName", "Sri Suresh Iyer");
  const attorney = val(d, "buyerName", "Sri Karthik Iyer");
  return {
    title: "GENERAL POWER OF ATTORNEY",
    subtitle: "Executed under the Powers of Attorney Act, 1882",
    jurisdiction: `${val(d, "district", "Chennai")}, State of ${val(d, "state", "Tamil Nadu")}`,
    applicableAct: "The Powers of Attorney Act, 1882 & Registration Act, 1908",
    place: val(d, "district", "Chennai"),
    executionDate: today(),
    documentNumber: docNo("POA"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `KNOW ALL MEN BY THESE PRESENTS that I, ${executant}, S/o ____________________, aged about ___ years, residing at ${val(d, "sellerAddress", "____________________________")}, hereinafter referred to as the "EXECUTANT", do hereby nominate, constitute and appoint ${attorney}, S/o ____________________, aged about ___ years, residing at ${val(d, "buyerAddress", "____________________________")}, hereinafter referred to as my "ATTORNEY", to do and execute all or any of the following acts, deeds, matters and things for and on my behalf and in my name:` },
      { kind: "list", ordered: true, items: [
        `To represent me before all statutory authorities, courts, tribunals, Sub-Registrars and government offices in relation to my properties, affairs and matters.`,
        `To sign, execute, present and register on my behalf any deed, agreement, application, affidavit, verification, memorandum or writing whatsoever.`,
        `To receive and pay monies, sign cheques, operate bank accounts and grant valid receipts and discharges in my name.`,
        `To institute, defend, compromise and settle any suit, appeal, revision or proceeding in any court of competent jurisdiction and to engage advocates and vakils.`,
        `Generally to do all such acts, deeds and things as may be necessary for the effective exercise of the powers hereby conferred, as fully and effectually as I could do if personally present.`,
      ]},
      { kind: "para", align: "justify",
        text: `I hereby ratify and confirm all lawful acts, deeds and things done by my said Attorney in exercise of the powers hereby conferred.` },
      { kind: "sig", parties: [
        { role: "EXECUTANT", name: executant },
        { role: "ATTORNEY", name: attorney },
      ]},
      { kind: "witnesses" },
    ],
  };
}

function will(d: DraftFormData): LegalDoc {
  const testator = val(d, "sellerName", "Smt. Lakshmi Devi");
  return {
    title: "LAST WILL AND TESTAMENT",
    subtitle: "Executed under the Indian Succession Act, 1925",
    jurisdiction: `${val(d, "district", "Bengaluru")}, State of ${val(d, "state", "Karnataka")}`,
    applicableAct: "Indian Succession Act, 1925",
    place: val(d, "district", "Bengaluru"),
    executionDate: today(),
    documentNumber: docNo("WL"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `THIS IS THE LAST WILL AND TESTAMENT executed by me, ${testator}, aged about ___ years, Indian Inhabitant, residing at ${val(d, "sellerAddress", "____________________________")}, being of sound mind, memory and understanding, and not acting under any coercion, undue influence or misrepresentation from any quarter whatsoever.` },
      { kind: "list", ordered: true, items: [
        `I hereby revoke all Wills, Codicils and Testamentary Dispositions, if any, made by me heretofore.`,
        `I declare that I am the absolute owner of the properties, movable and immovable, described in the Schedule hereunder, and I have full authority and testamentary capacity to bequeath the same.`,
        `Subject to the payment of my just debts, funeral expenses and testamentary charges, I bequeath all my properties, movable and immovable, whether presently owned or hereafter acquired, unto my legal heirs in the shares set out in the Schedule.`,
        `I hereby appoint Sri ____________________, S/o ____________________, resident of ____________________, as the Executor of this my Last Will and Testament.`,
      ]},
      { kind: "para", align: "justify",
        text: `IN WITNESS WHEREOF, I, the said Testator, have signed and executed this my Last Will and Testament on this ${today()} at ${val(d, "district", "Bengaluru")}, in the presence of the witnesses attesting hereunder, who have signed in my presence and in the presence of each other.` },
      { kind: "sig", parties: [{ role: "TESTATOR", name: testator }] },
      { kind: "witnesses" },
    ],
  };
}

function rentalAgreement(d: DraftFormData): LegalDoc {
  const landlord = val(d, "sellerName", "Sri Mohan Rao");
  const tenant = val(d, "buyerName", "Ms. Ananya Kapoor");
  const rent = val(d, "saleAmount", "35,000");
  return {
    title: "RENTAL AGREEMENT",
    subtitle: "Leave and Licence — 11 months (renewable)",
    jurisdiction: `${val(d, "district", "Pune")}, State of ${val(d, "state", "Maharashtra")}`,
    applicableAct: "Indian Contract Act, 1872 & applicable State Rent Control legislation",
    place: val(d, "district", "Pune"),
    executionDate: today(),
    documentNumber: docNo("RA"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `THIS RENTAL AGREEMENT is made and executed on this ${today()} at ${val(d, "district", "Pune")}, BETWEEN ${landlord}, residing at ${val(d, "sellerAddress", "____________________________")}, hereinafter called the "LANDLORD" of the ONE PART; AND ${tenant}, residing at ${val(d, "buyerAddress", "____________________________")}, hereinafter called the "TENANT" of the OTHER PART.` },
      { kind: "heading", text: "NOW THIS AGREEMENT WITNESSETH:" },
      { kind: "list", ordered: true, items: [
        `That the Landlord hereby lets out the premises described in the Schedule to the Tenant on a monthly rent of ₹${rent}/- payable on or before the 5th day of each calendar month.`,
        `That the term of tenancy shall be eleven (11) months commencing from ${today()}, renewable by mutual written consent on such terms as the parties may agree.`,
        `The Tenant has paid to the Landlord an interest-free refundable security deposit of ₹${val(d, "advanceAmount", (Number(rent.replace(/,/g, "")) * 2).toString())}/-, refundable at the time of vacation of premises subject to deductions for damage (fair wear and tear excepted) and unpaid dues.`,
        `The Tenant shall use the premises only for residential purposes and shall not sublet, assign or part with possession without prior written consent of the Landlord.`,
        `Electricity, water and society maintenance charges shall be borne by the Tenant. Property tax shall be borne by the Landlord.`,
        `Either party may terminate this Agreement by giving one (1) month's prior written notice.`,
        `In case of any dispute, the courts at ${val(d, "district", "Pune")} shall alone have exclusive jurisdiction.`,
      ]},
      { kind: "heading", text: "SCHEDULE OF PREMISES" },
      { kind: "block", text: val(d, "propertyAddress", "Flat No. ___, ______ Society, ______ Road, ______ — admeasuring approx. ______ sq. ft. carpet area.") },
      { kind: "sig", parties: [
        { role: "LANDLORD", name: landlord },
        { role: "TENANT", name: tenant },
      ]},
      { kind: "witnesses" },
    ],
  };
}

function employmentAgreement(d: DraftFormData): LegalDoc {
  const employer = val(d, "sellerName", "M/s. Skyline Technologies Pvt. Ltd.");
  const employee = val(d, "buyerName", "Sri Arjun Nair");
  return {
    title: "EMPLOYMENT AGREEMENT",
    subtitle: "Executed under the Indian Contract Act, 1872",
    jurisdiction: `${val(d, "district", "Bengaluru")}, State of ${val(d, "state", "Karnataka")}`,
    applicableAct: "Indian Contract Act, 1872; Shops & Establishments Act; Code on Wages, 2019",
    place: val(d, "district", "Bengaluru"),
    executionDate: today(),
    documentNumber: docNo("EMP"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `THIS EMPLOYMENT AGREEMENT is entered into on this ${today()} between ${employer}, a company incorporated under the Companies Act, 2013, having its registered office at ${val(d, "sellerAddress", "____________________________")} (hereinafter referred to as the "Company") of the ONE PART; AND ${employee}, residing at ${val(d, "buyerAddress", "____________________________")} (hereinafter referred to as the "Employee") of the OTHER PART.` },
      { kind: "list", ordered: true, items: [
        `Position & Duties: The Employee shall be engaged in the position of ${val(d, "propertyType", "Senior Software Engineer")} and shall discharge duties assigned by the Company diligently, faithfully and to the best of the Employee's abilities.`,
        `Term: This Agreement shall commence from ${val(d, "dateOfSale", today())} and continue until terminated in accordance with the provisions herein.`,
        `Compensation: The Company shall pay the Employee a gross annual compensation of ₹${val(d, "saleAmount", "24,00,000")}/- (Rupees ${val(d, "saleAmount", "24,00,000")} only) payable monthly, subject to statutory deductions.`,
        `Confidentiality: The Employee shall not, during or after the term of employment, disclose any confidential or proprietary information of the Company.`,
        `Non-Solicitation: For a period of twelve (12) months following termination, the Employee shall not solicit any employee or client of the Company.`,
        `Termination: Either party may terminate this Agreement by serving two (2) months' prior written notice or payment in lieu thereof.`,
        `Governing Law: This Agreement shall be governed by the laws of India and subject to the exclusive jurisdiction of courts at ${val(d, "district", "Bengaluru")}.`,
      ]},
      { kind: "sig", parties: [
        { role: "FOR THE COMPANY", name: employer },
        { role: "EMPLOYEE", name: employee },
      ]},
      { kind: "witnesses" },
    ],
  };
}

function nda(d: DraftFormData): LegalDoc {
  const p1 = val(d, "sellerName", "M/s. Skyline Technologies Pvt. Ltd.");
  const p2 = val(d, "buyerName", "M/s. Northline Consultancy LLP");
  return {
    title: "NON-DISCLOSURE AGREEMENT",
    subtitle: "Mutual — executed under the Indian Contract Act, 1872",
    jurisdiction: `${val(d, "district", "Mumbai")}, State of ${val(d, "state", "Maharashtra")}`,
    applicableAct: "Indian Contract Act, 1872 & Information Technology Act, 2000",
    place: val(d, "district", "Mumbai"),
    executionDate: today(),
    documentNumber: docNo("NDA"),
    version: 1,
    preparedBy: "JusticeLine AI",
    status: "Draft",
    sections: [
      { kind: "para", align: "justify",
        text: `THIS MUTUAL NON-DISCLOSURE AGREEMENT is entered into on this ${today()} BETWEEN ${p1}, having its registered office at ${val(d, "sellerAddress", "____________________________")} ("Disclosing Party"); AND ${p2}, having its office at ${val(d, "buyerAddress", "____________________________")} ("Receiving Party"). Each a "Party" and collectively the "Parties".` },
      { kind: "list", ordered: true, items: [
        `"Confidential Information" shall mean all information, technical, financial, commercial or otherwise, disclosed by one Party to the other in written, oral, electronic or any other form, whether or not marked as confidential.`,
        `The Receiving Party shall use the Confidential Information solely for the purpose of evaluating a potential business relationship between the Parties (the "Purpose") and for no other purpose whatsoever.`,
        `The Receiving Party shall protect the Confidential Information with the same degree of care as it uses for its own confidential information, and in no event less than a reasonable degree of care.`,
        `The obligations of confidentiality shall survive for a period of three (3) years from the date of disclosure.`,
        `Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts at ${val(d, "district", "Mumbai")}.`,
      ]},
      { kind: "sig", parties: [
        { role: "DISCLOSING PARTY", name: p1 },
        { role: "RECEIVING PARTY", name: p2 },
      ]},
    ],
  };
}

function petition(title: string, actLabel: string) {
  return (d: DraftFormData): LegalDoc => {
    const petitioner = val(d, "sellerName", "Sri Rakesh Menon");
    const respondent = val(d, "buyerName", "State of Kerala & Ors.");
    return {
      title: title.toUpperCase(),
      subtitle: `Filed under ${actLabel}`,
      jurisdiction: `Hon'ble High Court of ${val(d, "state", "Kerala")} at ${val(d, "district", "Ernakulam")}`,
      applicableAct: actLabel,
      place: val(d, "district", "Ernakulam"),
      executionDate: today(),
      documentNumber: docNo("PT"),
      version: 1,
      preparedBy: "JusticeLine AI",
      status: "Draft",
      sections: [
        { kind: "para", align: "center", text: `IN THE HON'BLE HIGH COURT OF ${val(d, "state", "KERALA").toUpperCase()} AT ${val(d, "district", "ERNAKULAM").toUpperCase()}` },
        { kind: "para", align: "center", text: `${title.toUpperCase()} NO. ______ OF ${new Date().getFullYear()}` },
        { kind: "para", align: "left", text: `IN THE MATTER OF:\n\n${petitioner} …… PETITIONER\n\nVersus\n\n${respondent} …… RESPONDENT(S)` },
        { kind: "heading", text: `${title.toUpperCase()} UNDER ${actLabel.toUpperCase()}` },
        { kind: "para", align: "justify", text: `MOST RESPECTFULLY SHEWETH:` },
        { kind: "list", ordered: true, items: [
          `That the Petitioner is a citizen of India and is competent to file the present ${title.toLowerCase()}. The Respondent is a proper and necessary party to the present proceedings.`,
          `That the cause of action for filing the present ${title.toLowerCase()} arose within the territorial jurisdiction of this Hon'ble Court, and this Hon'ble Court has the necessary jurisdiction to entertain, try and dispose of the present ${title.toLowerCase()}.`,
          `That the brief facts leading to the filing of the present ${title.toLowerCase()} are as follows: ${val(d, "propertyAddress", "___________________________________________")}.`,
          `That the Petitioner has no other equally efficacious alternative remedy except to approach this Hon'ble Court by way of the present ${title.toLowerCase()}.`,
          `That the Petitioner has not filed any other similar petition either before this Hon'ble Court or before any other Court of law in respect of the subject matter herein.`,
        ]},
        { kind: "heading", text: "PRAYER" },
        { kind: "para", align: "justify", text: `In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:` },
        { kind: "list", ordered: true, items: [
          `Issue appropriate writ, order or direction in the nature of ${title} granting the relief sought by the Petitioner;`,
          `Award costs of the present proceedings in favour of the Petitioner;`,
          `Pass such other and further order(s) as this Hon'ble Court may deem fit and proper in the facts and circumstances of the case, in the interest of justice.`,
        ]},
        { kind: "sig", parties: [
          { role: "PETITIONER", name: petitioner },
          { role: "COUNSEL FOR THE PETITIONER", name: "Advocate on Record" },
        ]},
      ],
    };
  };
}

// Generic Indian legal document for any remaining slug.
function generic(title: string, category: string) {
  return (d: DraftFormData): LegalDoc => {
    const p1 = val(d, "sellerName", "Party of the First Part");
    const p2 = val(d, "buyerName", "Party of the Second Part");
    return {
      title: title.toUpperCase(),
      subtitle: `Executed in accordance with applicable laws of India`,
      jurisdiction: `${val(d, "district", "New Delhi")}, ${val(d, "state", "Delhi")}`,
      applicableAct: `Indian Contract Act, 1872 & other applicable statutes governing ${category}`,
      place: val(d, "district", "New Delhi"),
      executionDate: today(),
      documentNumber: docNo(title),
      version: 1,
      preparedBy: "JusticeLine AI",
      status: "Draft",
      sections: [
        { kind: "para", align: "justify",
          text: `THIS ${title.toUpperCase()} is made and executed on this ${today()} at ${val(d, "district", "New Delhi")}, BETWEEN ${p1}, residing / having its office at ${val(d, "sellerAddress", "____________________________")}, hereinafter referred to as the "FIRST PARTY" of the ONE PART; AND ${p2}, residing / having its office at ${val(d, "buyerAddress", "____________________________")}, hereinafter referred to as the "SECOND PARTY" of the OTHER PART.` },
        { kind: "heading", text: "WHEREAS:" },
        { kind: "list", ordered: true, items: [
          `The Parties hereto are desirous of recording the terms and conditions governing the ${title} in a formal written instrument for the sake of clarity and mutual benefit.`,
          `The recitals hereto shall form an integral and operative part of this ${title} as if the same were incorporated in the body hereof.`,
          `The Parties represent that they have the requisite legal capacity, authority and competence to enter into and perform their respective obligations hereunder.`,
        ]},
        { kind: "heading", text: "NOW THIS DEED WITNESSETH:" },
        { kind: "list", ordered: true, items: [
          `Subject Matter: This ${title} pertains to ${val(d, "propertyAddress", "the subject matter more particularly described in the Schedule hereto")}.`,
          `Consideration: In consideration of the mutual covenants set out herein, the Parties shall be bound by the terms of this ${title}.`,
          `Term: This ${title} shall come into force on the date of execution hereof and shall remain valid until duly discharged in accordance with law.`,
          `Representations & Warranties: Each Party represents that the execution and performance of this ${title} shall not violate any law, order, judgment or contractual obligation binding upon it.`,
          `Indemnity: Each Party shall indemnify the other against any loss, damage or claim arising from a breach of the terms hereof.`,
          `Notices: All notices under this ${title} shall be in writing and delivered to the addresses set forth hereinabove or such other address as may be notified in writing.`,
          `Governing Law & Jurisdiction: This ${title} shall be governed by and construed in accordance with the laws of India. The courts at ${val(d, "district", "New Delhi")} shall have exclusive jurisdiction.`,
          `Dispute Resolution: Any dispute arising out of or in connection with this ${title} shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, before a sole arbitrator mutually appointed by the Parties.`,
        ]},
        { kind: "para", align: "justify",
          text: `IN WITNESS WHEREOF, the Parties hereto have set and subscribed their respective hands on the day, month and year first hereinabove written, in the presence of the witnesses attesting hereunder.` },
        { kind: "sig", parties: [
          { role: "FIRST PARTY", name: p1 },
          { role: "SECOND PARTY", name: p2 },
        ]},
        { kind: "witnesses" },
      ],
    };
  };
}

// slug → { title, category, generator }
export type SlugMeta = { title: string; category: string; gen: (d: DraftFormData) => LegalDoc };

export const SLUG_TO_DOC: Record<string, SlugMeta> = {
  // Property
  "sale-deed": { title: "Sale Deed", category: "Property Documents", gen: saleDeed },
  "gift-deed": { title: "Gift Deed", category: "Property Documents", gen: generic("Gift Deed", "Property Documents") },
  "lease-deed": { title: "Lease Deed", category: "Property Documents", gen: generic("Lease Deed", "Property Documents") },
  "rental-agreement": { title: "Rental Agreement", category: "Property Documents", gen: rentalAgreement },
  "mortgage-deed": { title: "Mortgage Deed", category: "Property Documents", gen: generic("Mortgage Deed", "Property Documents") },
  "partition-deed": { title: "Partition Deed", category: "Property Documents", gen: generic("Partition Deed", "Property Documents") },
  "relinquishment-deed": { title: "Relinquishment Deed", category: "Property Documents", gen: generic("Relinquishment Deed", "Property Documents") },
  "settlement-deed": { title: "Settlement Deed", category: "Property Documents", gen: generic("Settlement Deed", "Property Documents") },
  "exchange-deed": { title: "Exchange Deed", category: "Property Documents", gen: generic("Exchange Deed", "Property Documents") },
  "rectification-deed": { title: "Rectification Deed", category: "Property Documents", gen: generic("Rectification Deed", "Property Documents") },
  "release-deed": { title: "Release Deed", category: "Property Documents", gen: generic("Release Deed", "Property Documents") },
  "conveyance-deed": { title: "Conveyance Deed", category: "Property Documents", gen: generic("Conveyance Deed", "Property Documents") },
  // Court
  "affidavit": { title: "Affidavit", category: "Court Documents", gen: affidavit },
  "legal-notice": { title: "Legal Notice", category: "Court Documents", gen: legalNotice },
  "petition": { title: "Petition", category: "Court Documents", gen: petition("Petition", "Article 226 of the Constitution of India") },
  "appeal": { title: "Appeal", category: "Court Documents", gen: petition("Appeal", "Section 96 of the Code of Civil Procedure, 1908") },
  "written-statement": { title: "Written Statement", category: "Court Documents", gen: generic("Written Statement", "Court Documents") },
  "counter-affidavit": { title: "Counter Affidavit", category: "Court Documents", gen: affidavit },
  "caveat-petition": { title: "Caveat Petition", category: "Court Documents", gen: petition("Caveat Petition", "Section 148A of the Code of Civil Procedure, 1908") },
  "bail-application": { title: "Bail Application", category: "Court Documents", gen: petition("Bail Application", "Section 439 of the Code of Criminal Procedure, 1973") },
  "writ-petition": { title: "Writ Petition", category: "Court Documents", gen: petition("Writ Petition", "Article 226 of the Constitution of India") },
  "revision-petition": { title: "Revision Petition", category: "Court Documents", gen: petition("Revision Petition", "Section 115 of the Code of Civil Procedure, 1908") },
  "review-petition": { title: "Review Petition", category: "Court Documents", gen: petition("Review Petition", "Order XLVII Rule 1 of the Code of Civil Procedure, 1908") },
  "memo": { title: "Memo", category: "Court Documents", gen: generic("Memo of Appearance", "Court Documents") },
  "vakalatnama": { title: "Vakalatnama", category: "Court Documents", gen: generic("Vakalatnama", "Court Documents") },
  // Business
  "employment-agreement": { title: "Employment Agreement", category: "Business Agreements", gen: employmentAgreement },
  "partnership-agreement": { title: "Partnership Agreement", category: "Business Agreements", gen: generic("Partnership Agreement", "Business Agreements") },
  "nda": { title: "Non-Disclosure Agreement", category: "Business Agreements", gen: nda },
  "service-agreement": { title: "Service Agreement", category: "Business Agreements", gen: generic("Service Agreement", "Business Agreements") },
  "vendor-agreement": { title: "Vendor Agreement", category: "Business Agreements", gen: generic("Vendor Agreement", "Business Agreements") },
  "consultancy-agreement": { title: "Consultancy Agreement", category: "Business Agreements", gen: generic("Consultancy Agreement", "Business Agreements") },
  "franchise-agreement": { title: "Franchise Agreement", category: "Business Agreements", gen: generic("Franchise Agreement", "Business Agreements") },
  "mou": { title: "Memorandum of Understanding", category: "Business Agreements", gen: generic("Memorandum of Understanding", "Business Agreements") },
  "joint-venture-agreement": { title: "Joint Venture Agreement", category: "Business Agreements", gen: generic("Joint Venture Agreement", "Business Agreements") },
  "shareholders-agreement": { title: "Shareholders Agreement", category: "Business Agreements", gen: generic("Shareholders Agreement", "Business Agreements") },
  "software-development-agreement": { title: "Software Development Agreement", category: "Business Agreements", gen: generic("Software Development Agreement", "Business Agreements") },
  // Personal
  "will": { title: "Will", category: "Personal Documents", gen: will },
  "power-of-attorney": { title: "Power of Attorney", category: "Personal Documents", gen: powerOfAttorney },
  "declaration": { title: "Declaration", category: "Personal Documents", gen: affidavit },
  "name-change-affidavit": { title: "Name Change Affidavit", category: "Personal Documents", gen: affidavit },
  "marriage-affidavit": { title: "Marriage Affidavit", category: "Personal Documents", gen: affidavit },
  "divorce-settlement-agreement": { title: "Divorce Settlement Agreement", category: "Personal Documents", gen: generic("Divorce Settlement Agreement", "Personal Documents") },
  "adoption-deed": { title: "Adoption Deed", category: "Personal Documents", gen: generic("Adoption Deed", "Personal Documents") },
  "guardianship-declaration": { title: "Guardianship Declaration", category: "Personal Documents", gen: generic("Guardianship Declaration", "Personal Documents") },
  // Family
  "marriage-agreement": { title: "Marriage Agreement", category: "Family Documents", gen: generic("Marriage Agreement", "Family Documents") },
  "divorce-petition": { title: "Divorce Petition", category: "Family Documents", gen: petition("Divorce Petition", "Section 13 of the Hindu Marriage Act, 1955") },
  "child-custody-petition": { title: "Child Custody Petition", category: "Family Documents", gen: petition("Child Custody Petition", "Guardians and Wards Act, 1890") },
  "maintenance-petition": { title: "Maintenance Petition", category: "Family Documents", gen: petition("Maintenance Petition", "Section 125 of the Code of Criminal Procedure, 1973") },
  "succession-certificate": { title: "Succession Certificate Application", category: "Family Documents", gen: petition("Application for Succession Certificate", "Part X of the Indian Succession Act, 1925") },
  "family-settlement-deed": { title: "Family Settlement Deed", category: "Family Documents", gen: generic("Family Settlement Deed", "Family Documents") },
  // Company
  "board-resolution": { title: "Board Resolution", category: "Company Documents", gen: generic("Board Resolution", "Company Documents") },
  "moa": { title: "Memorandum of Association", category: "Company Documents", gen: generic("Memorandum of Association", "Company Documents") },
  "aoa": { title: "Articles of Association", category: "Company Documents", gen: generic("Articles of Association", "Company Documents") },
  "offer-letter": { title: "Employment Offer Letter", category: "Company Documents", gen: employmentAgreement },
  "appointment-letter": { title: "Appointment Letter", category: "Company Documents", gen: employmentAgreement },
  "resignation-acceptance": { title: "Resignation Acceptance Letter", category: "Company Documents", gen: generic("Resignation Acceptance Letter", "Company Documents") },
  "experience-certificate": { title: "Experience Certificate", category: "Company Documents", gen: generic("Experience Certificate", "Company Documents") },
};

export function buildDoc(slug: string, data: DraftFormData): LegalDoc {
  const meta = SLUG_TO_DOC[slug];
  if (!meta) return generic("Legal Document", "General")(data);
  return meta.gen(data);
}

/** Flat plain-text export (used by Copy). */
export function docToPlainText(doc: LegalDoc): string {
  const lines: string[] = [];
  lines.push(doc.title);
  if (doc.subtitle) lines.push(doc.subtitle);
  lines.push("");
  lines.push(`Document No.: ${doc.documentNumber}`);
  if (doc.registrationNumber) lines.push(`Registration: ${doc.registrationNumber}`);
  lines.push(`Place: ${doc.place}    Date: ${doc.executionDate}`);
  lines.push(`Jurisdiction: ${doc.jurisdiction}`);
  lines.push(`Applicable Act: ${doc.applicableAct}`);
  lines.push("");
  for (const s of doc.sections) {
    if (s.kind === "para") lines.push(s.text, "");
    else if (s.kind === "heading") lines.push("", s.text.toUpperCase(), "");
    else if (s.kind === "list") s.items.forEach((it, i) => lines.push(`${s.ordered ? `${i + 1}.` : "•"} ${it}`));
    else if (s.kind === "block") lines.push((s.label ? s.label + ": " : "") + s.text, "");
    else if (s.kind === "sig") {
      lines.push("");
      s.parties.forEach((p) => lines.push(`__________________________    ${p.role} — ${p.name}`));
    } else if (s.kind === "witnesses") {
      lines.push("", "WITNESS 1: __________________________", "WITNESS 2: __________________________");
    }
  }
  lines.push("", `Prepared by ${doc.preparedBy} · Version ${doc.version} · Status: ${doc.status}`);
  return lines.join("\n");
}

/** MS Word-compatible HTML for .doc export. */
export function docToWordHtml(doc: LegalDoc): string {
  const sectionsHtml = doc.sections.map((s) => {
    if (s.kind === "para") return `<p style="text-align:${s.align || "justify"}">${escapeHtml(s.text).replace(/\n/g, "<br/>")}</p>`;
    if (s.kind === "heading") return `<h2 style="font-family:Georgia,serif;text-align:center;margin-top:18pt;">${escapeHtml(s.text)}</h2>`;
    if (s.kind === "list") {
      const tag = s.ordered ? "ol" : "ul";
      return `<${tag}>${s.items.map((i) => `<li style="text-align:justify;margin:6pt 0">${escapeHtml(i)}</li>`).join("")}</${tag}>`;
    }
    if (s.kind === "block") return `<div style="border:1px solid #999;padding:10pt;margin:10pt 0;text-align:justify">${s.label ? `<b>${escapeHtml(s.label)}: </b>` : ""}${escapeHtml(s.text)}</div>`;
    if (s.kind === "sig") return `<table width="100%" style="margin-top:40pt"><tr>${s.parties.map((p) => `<td style="width:${100 / s.parties.length}%;text-align:center;padding-top:40pt;border-top:1px solid #000">${escapeHtml(p.role)}<br/>${escapeHtml(p.name)}</td>`).join("")}</tr></table>`;
    if (s.kind === "witnesses") return `<table width="100%" style="margin-top:24pt"><tr><td style="width:50%;padding-top:36pt;border-top:1px solid #000">WITNESS 1</td><td style="width:50%;padding-top:36pt;border-top:1px solid #000">WITNESS 2</td></tr></table>`;
    return "";
  }).join("\n");

  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/><title>${escapeHtml(doc.title)}</title><style>
@page { size: A4; margin: 1in; }
body { font-family: "Times New Roman", Georgia, serif; font-size: 12pt; line-height: 1.7; color: #111; }
h1 { text-align:center; letter-spacing: 4pt; text-decoration: underline; }
p { text-align: justify; }
</style></head><body>
<div style="text-align:center;font-size:9pt;color:#555;border-bottom:1px solid #999;padding-bottom:6pt;margin-bottom:18pt">
JUSTICELINE AI · GENERATED LEGAL DRAFT · Doc No. ${escapeHtml(doc.documentNumber)} · Version ${doc.version} · ${escapeHtml(doc.executionDate)}
</div>
<h1>${escapeHtml(doc.title)}</h1>
${doc.subtitle ? `<p style="text-align:center;font-style:italic">${escapeHtml(doc.subtitle)}</p>` : ""}
<p style="text-align:center;font-size:10pt;color:#555">
${escapeHtml(doc.jurisdiction)} · ${escapeHtml(doc.applicableAct)}
</p>
${sectionsHtml}
<div style="text-align:center;font-size:9pt;color:#555;border-top:1px solid #999;padding-top:6pt;margin-top:24pt">
Prepared by ${escapeHtml(doc.preparedBy)} · ${escapeHtml(doc.place)} · ${escapeHtml(doc.executionDate)}
</div>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
