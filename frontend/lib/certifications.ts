/**
 * M.D. Hygiene's certifications, transcribed from the certificates themselves.
 *
 * Certificate numbers, issuing bodies, scopes and dates are copied from the
 * documents — nothing here is inferred. The "what / why" lines describe what
 * the standard covers generally; they never claim a scope the certificate
 * doesn't grant.
 *
 * `featured` marks the handful shown on the homepage band. Everything else is
 * on /certifications.
 *
 * When a certificate is renewed, update `validUntilIso` here. Anything past
 * its date drops off the public pages on its own — see activeCertifications().
 */

export type Certification = {
  /** URL fragment; also how the homepage badge links to its entry. */
  id: string;
  /** Badge text. */
  name: string;
  fullName: string;
  /** The standard or directive assessed against, where the certificate names one. */
  standard?: string;
  issuer: string;
  certificateNumber: string;
  scope: string;
  /**
   * Expiry date, not shown on the page — it is only what the expiry filter
   * sorts on, so a lapsed certificate stops being advertised.
   */
  validUntilIso: string;
  what: string;
  why: string;
  featured: boolean;
  /** Scan of the certificate itself, in the public media bucket. */
  previewUrl: string;
};

const PREVIEW_BASE =
  "https://gtpvibbeqlndkaezqniz.supabase.co/storage/v1/object/public/media/certificates";

/** Preview image for a certificate, uploaded as <id>.jpg. */
function preview(id: string): string {
  return `${PREVIEW_BASE}/${id}.jpg`;
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: "bis",
    name: "BIS",
    fullName: "Bureau of Indian Standards licence",
    standard: "IS 5405:2019 — Sanitary Napkins",
    issuer: "Bureau of Indian Standards, Surat Branch Office",
    certificateNumber: "CM/L-7200133594",
    scope: "Sanitary napkins",
    validUntilIso: "2027-10-28",
    what: "India's national standards body licenses the manufacturer to carry the Standard Mark on a product tested against a published Indian Standard — here IS 5405, the specification for sanitary napkins.",
    why: "For government and institutional tenders this is usually the first requirement on the list: it shows the product has been tested against a national specification, not an in-house one.",
    previewUrl: preview("bis"),
    featured: true,
  },
  {
    id: "iso-13485",
    name: "ISO 13485",
    fullName: "Medical Device — Quality Management System",
    standard: "ISO 13485:2016",
    issuer: "BSCIC Certifications Pvt. Ltd. — accredited by NABCB (QM 030), IAF MLA member",
    certificateNumber: "BN23942/22619",
    scope:
      "Design, manufacture and supply of sanitary pads, sanitary napkins and adult/baby diapers. Technical area: non-active medical devices, A.1.1.21",
    validUntilIso: "2028-03-12",
    what: "The quality management standard written specifically for medical devices. It goes beyond general quality management into design control, risk management, traceability, sterile and clean-room conditions where relevant, and post-market surveillance.",
    why: "It is the most demanding quality system a hygiene manufacturer can hold, and it covers design as well as manufacture — which matters if you are asking us to develop a product rather than just produce one.",
    previewUrl: preview("iso-13485"),
    featured: true,
  },
  {
    id: "who-gmp",
    name: "WHO-GMP",
    fullName: "Good Manufacturing Practice",
    issuer: "IPQC — International Productivity and Quality Council",
    certificateNumber: "2182/GMP/24",
    scope:
      "Cosmetic products, sanitary pads, baby and adult diapers, underpads, baby wet wipes, sanitary napkins, tampons and towels, and sanitary preparations for personal, veterinary and medical purposes",
    validUntilIso: "2027-05-30",
    what: "Good Manufacturing Practice assessed against the World Health Organization's framework: premises and equipment, personnel hygiene, material handling, process control, cleaning validation and batch records.",
    why: "It is the difference between a product that happens to pass a test and a process built to produce the same result every batch — which is what matters when you are ordering by the container load.",
    previewUrl: preview("who-gmp"),
    featured: true,
  },
  {
    id: "ce",
    name: "CE",
    fullName: "Certificate of Compliance — EU directives",
    standard:
      "Medical Device Directive 93/42/EEC as amended by 2007/47/EC, and PPE Directive 89/686/EEC",
    issuer: "VRS Certifications Services Pvt. Ltd. — accredited by IAFCB",
    certificateNumber: "7309/CE/R001",
    scope: "Gloves, PPE kits, masks, baby diapers, sanitary pads, sanitary napkins and tissue papers",
    validUntilIso: "2027-05-26",
    what: "An assessment that the technical file for the products conforms to the essential health and safety requirements of the European directives named above.",
    why: "It is what makes the range exportable into European markets, and it shows the technical file, testing and labelling behind each product are documented to EU expectations.",
    previewUrl: preview("ce"),
    featured: true,
  },
  {
    id: "iso-9001",
    name: "ISO 9001",
    fullName: "Quality Management System",
    standard: "ISO 9001:2015",
    issuer: "Eurocert Inspection Limited — UKAF",
    certificateNumber: "2025121639",
    scope:
      "Manufacturing of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2028-12-15",
    what: "The international standard for quality management systems: documented processes, defined responsibilities, control of non-conforming product, corrective action and continual improvement, verified by independent audit.",
    why: "The most widely recognised proof of a working quality system, and a common prequalification requirement in tenders and export contracts.",
    previewUrl: preview("iso-9001"),
    featured: false,
  },
  {
    id: "iso-14001",
    name: "ISO 14001",
    fullName: "Environmental Management System",
    standard: "ISO 14001:2015",
    issuer: "QRO Certification LLP — EGAC, IAF MLA member",
    certificateNumber: "305025070248E",
    scope:
      "Manufacturing of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2028-07-01",
    what: "The environmental management standard: identifying the environmental impact of the operation, setting objectives against it, and controlling waste, emissions and resource use under audit.",
    why: "Buyers with their own sustainability reporting increasingly need their suppliers to hold it, and public-sector tenders are beginning to score it.",
    previewUrl: preview("iso-14001"),
    featured: false,
  },
  {
    id: "iso-27001",
    name: "ISO/IEC 27001",
    fullName: "Information Security Management System",
    standard: "ISO/IEC 27001:2022",
    issuer: "VRS Certifications Services Pvt. Ltd. — accredited by IAFCB",
    certificateNumber: "2597SAFV2021",
    scope:
      "Manufacturing and trading of gloves, PPE kits, masks, baby diapers, sanitary pads, sanitary napkins and tissue papers",
    validUntilIso: "2027-05-26",
    what: "The standard for managing information security: how commercial, design and customer data is classified, accessed, retained and protected, with risks assessed and controls audited.",
    why: "Relevant to private-label clients in particular — your formulations, artwork, volumes and pricing sit with us, and this is the audited system that governs how they are handled.",
    previewUrl: preview("iso-27001"),
    featured: false,
  },
  {
    id: "iso-17088",
    name: "ISO 17088",
    fullName: "Specifications for compostable plastics",
    standard: "ISO 17088:2021 — Plastics, organic recycling",
    issuer: "QVA Certification — accredited by UGAC",
    certificateNumber: "MDHY-26-4870286",
    scope: "Manufacturer and trader of sanitary napkins",
    validUntilIso: "2029-01-19",
    what: "The specification a plastic has to meet to be called compostable — covering disintegration, biodegradation and the absence of harmful residue in the compost that results.",
    why: "Disposable hygiene is under growing scrutiny for what it leaves behind. This is the recognised way to substantiate a compostability claim rather than assert it.",
    previewUrl: preview("iso-17088"),
    featured: false,
  },
  {
    id: "iso-14855",
    name: "ISO 14855-1",
    fullName: "Aerobic biodegradability under controlled composting conditions",
    standard: "ISO 14855-1:2012",
    issuer: "QVA Certification — accredited by UGAC",
    certificateNumber: "PYCA-26-4870689",
    scope:
      "Manufacture of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2029-07-05",
    what: "The test method behind a composting claim: it measures how completely a material breaks down under controlled composting conditions, by tracking the carbon dioxide evolved.",
    why: "It is the measurement that a compostability specification such as ISO 17088 relies on, so the two are usually asked for together.",
    previewUrl: preview("iso-14855"),
    featured: false,
  },
  {
    id: "iso-9845",
    name: "ISO 9845-1",
    fullName: "Certificate of compliance — ISO 9845-1:2022",
    standard: "ISO 9845-1:2022",
    issuer: "QVA Certification — accredited by UGAC",
    certificateNumber: "PYCA-26-4870690",
    scope:
      "Manufacture of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2029-07-05",
    what: "An independent assessment by QVA that the manufacturing system meets this standard across the scope listed above.",
    why: "Part of the documentation pack we supply to buyers and tender committees on request.",
    previewUrl: preview("iso-9845"),
    featured: false,
  },
  {
    id: "iso-9833",
    name: "ISO 9833",
    fullName: "Certificate of compliance — ISO 9833:1993",
    standard: "ISO 9833:1993",
    issuer: "QVA Certification — accredited by UGAC",
    certificateNumber: "PYCA-26-4870691",
    scope:
      "Manufacture of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2029-07-05",
    what: "An independent assessment by QVA that the manufacturing system meets this standard across the scope listed above.",
    why: "Part of the documentation pack we supply to buyers and tender committees on request.",
    previewUrl: preview("iso-9833"),
    featured: false,
  },
  {
    id: "iso-17088-2008",
    name: "ISO 17088:2008",
    fullName: "Specifications for compostable plastics (superseded)",
    standard: "ISO 17088:2008",
    issuer: "Delta 300 Global Certification Solutions Pvt. Ltd.",
    certificateNumber: "10240623",
    scope:
      "Manufacture of sanitary pads, baby diapers, adult diapers, sanitary napkins, tampons and towels, and sanitary preparations for veterinary and medical purposes",
    validUntilIso: "2026-05-31",
    what: "The earlier edition of the compostable-plastics specification, superseded by the 2021 certificate above.",
    why: "Kept on record; the current ISO 17088:2021 certificate is the one in force.",
    previewUrl: preview("iso-17088-2008"),
    featured: false,
  },
];

/** URL fragment for a mark, so a badge can link to its entry on the page. */
export function certificationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Everything still in date.
 *
 * An expired certificate on a public page is worse than no certificate — a
 * buyer who checks the date finds a claim that no longer holds — so they drop
 * off by themselves rather than waiting for someone to notice.
 */
export function activeCertifications(now: Date = new Date()): Certification[] {
  const today = now.toISOString().slice(0, 10);
  return CERTIFICATIONS.filter((cert) => cert.validUntilIso >= today);
}

/** The handful shown on the homepage band. */
export function featuredCertifications(now?: Date): Certification[] {
  return activeCertifications(now).filter((cert) => cert.featured);
}

/**
 * Matches a name stored in site settings ("GMP", "CE Certified") to a
 * catalogue entry, so the admin list and the catalogue stay in step without
 * having to be written identically.
 */
export function findCertification(stored: string): Certification | null {
  const needle = stored.trim().toLowerCase();
  if (!needle) return null;
  return (
    CERTIFICATIONS.find((cert) => cert.name.toLowerCase() === needle) ??
    CERTIFICATIONS.find(
      (cert) => needle.includes(cert.name.toLowerCase()) || cert.name.toLowerCase().includes(needle)
    ) ??
    null
  );
}
