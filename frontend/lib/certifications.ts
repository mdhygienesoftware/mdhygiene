/**
 * Reference notes for the certification marks listed in site content.
 *
 * The settings record holds only the mark's name ("CE", "HACCP"), which is
 * enough for a badge but not for a page. These entries explain what each mark
 * is and why a buyer should care, and are matched to the stored names loosely
 * so "GMP Certified" and "GMP" both find their entry.
 *
 * They describe what the mark itself means, never which specific licence or
 * scope M.D. Hygiene holds — that varies by product and renewal date and
 * belongs on the certificate, not in code.
 */

export type CertificationNote = {
  /** Display name, used when it differs from what's stored in settings. */
  name: string;
  /** Expanded name or issuing body. */
  fullName: string;
  what: string;
  why: string;
};

const NOTES: { match: RegExp; note: CertificationNote }[] = [
  {
    match: /\bbis\b|bureau of indian/i,
    note: {
      name: "BIS",
      fullName: "Bureau of Indian Standards",
      what: "India's national standards body. It publishes the Indian Standards that consumer products are tested against and licenses manufacturers to mark goods that conform to them.",
      why: "For institutional and government buyers, a BIS licence is often the baseline requirement in a tender — it shows the product has been tested against a published national specification rather than an in-house one.",
    },
  },
  {
    match: /\bce\b/i,
    note: {
      name: "CE",
      fullName: "Conformité Européenne",
      what: "The conformity marking required for goods placed on the market in the European Economic Area. It is the manufacturer's declaration that the product meets the applicable EU health, safety and environmental requirements.",
      why: "It is what makes a product exportable into European markets, and it signals that the technical file, testing and labelling behind the product are documented to EU expectations.",
    },
  },
  {
    match: /\bgmp\b|good manufacturing/i,
    note: {
      name: "GMP",
      fullName: "Good Manufacturing Practice",
      what: "A quality system covering how a factory is run: premises and equipment, personnel hygiene, material handling, process control, cleaning validation and batch record-keeping.",
      why: "It is the difference between a product that happens to pass a test and a process built to produce the same result every batch — which is what matters when you are ordering by the container load.",
    },
  },
  {
    match: /haccp/i,
    note: {
      name: "HACCP",
      fullName: "Hazard Analysis and Critical Control Points",
      what: "A preventive system that maps every step of production, identifies where contamination could enter, and sets measurable control limits and monitoring at those points.",
      why: "For absorbent hygiene products worn against skin, it demonstrates contamination risk is designed out of the line and monitored continuously, not caught by end-of-line inspection.",
    },
  },
  {
    match: /\biaf\b|international accreditation/i,
    note: {
      name: "IAF",
      fullName: "International Accreditation Forum",
      what: "The worldwide association of the bodies that accredit certification bodies. An IAF mark on a certificate indicates the organisation that issued it is itself accredited under a recognised scheme.",
      why: "It is the check on the checker: it tells you the certificate came from an accredited body rather than an unrecognised one, and that it is accepted internationally.",
    },
  },
  {
    match: /\biso\b/i,
    note: {
      name: "ISO",
      fullName: "International Organization for Standardization",
      what: "The body behind the international management-system standards, most commonly ISO 9001 for quality management — a documented system for controlling processes, non-conformities and continuous improvement.",
      why: "It is the most widely recognised proof of a working quality system, and is frequently a prequalification requirement in tenders and export contracts.",
    },
  },
  {
    match: /sgcci|southern gujarat chamber/i,
    note: {
      name: "SGCCI",
      fullName: "The Southern Gujarat Chamber of Commerce & Industry",
      what: "One of the region's established industry chambers, representing manufacturers across South Gujarat in trade, policy and export promotion.",
      why: "Membership places the factory inside the region's formal industrial body — useful context for buyers verifying that they are dealing with an established manufacturer.",
    },
  },
  {
    match: /make in india/i,
    note: {
      name: "Make in India",
      fullName: "Government of India manufacturing initiative",
      what: "A national initiative promoting domestic manufacturing. It is a mark of origin and participation rather than a product-testing certification.",
      why: "For government and institutional tenders that carry local-content requirements, domestic manufacture is often a condition of eligibility.",
    },
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
 * The note for a stored certification name, or null when there isn't one.
 * Unmatched marks still render — with the name alone — rather than vanishing.
 */
export function certificationNote(stored: string): CertificationNote | null {
  return NOTES.find((entry) => entry.match.test(stored))?.note ?? null;
}
