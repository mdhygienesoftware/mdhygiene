import type { CareersContent } from "@/lib/types";

/**
 * Shown until someone saves the careers block in Admin → Careers.
 *
 * The openings list starts empty on purpose: inventing job titles would put
 * roles on the public site that nobody is actually hiring for. With none
 * listed, the page invites speculative applications instead, which the form
 * handles the same way.
 */
export const DEFAULT_CAREERS: CareersContent = {
  eyebrow: "CAREERS",
  heading: "Grow with a team of 100+",
  body: "Production, quality, sales and export roles at our Surat facility.",
  cta_label: "View openings",
  perks: [
    "Production, quality, sales and design under one roof",
    "A 500+ distributor network to sell into",
    "Room to grow across lines as capacity expands",
  ],
  openings: [],
  closing_note:
    "Nothing listed that fits? Send us your details anyway — we keep applications on file and get in touch when something opens up.",
};

/** Fills in anything a saved record is missing, so the page never renders blank. */
export function withCareerDefaults(saved: Partial<CareersContent> | null): CareersContent {
  if (!saved) return DEFAULT_CAREERS;
  return {
    eyebrow: saved.eyebrow || DEFAULT_CAREERS.eyebrow,
    heading: saved.heading || DEFAULT_CAREERS.heading,
    body: saved.body || DEFAULT_CAREERS.body,
    cta_label: saved.cta_label || DEFAULT_CAREERS.cta_label,
    perks: saved.perks?.length ? saved.perks : DEFAULT_CAREERS.perks,
    openings: saved.openings ?? [],
    closing_note: saved.closing_note || DEFAULT_CAREERS.closing_note,
  };
}
