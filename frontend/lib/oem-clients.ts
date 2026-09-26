import type { OemClientsBlock } from "@/lib/types";

/**
 * Shown until someone saves the block in Admin → OEM / Private Label.
 *
 * The logos ship as files under public/images/oem rather than going through
 * Storage, because they are fixed assets of the site rather than content that
 * turns over. Replacing one from the admin panel still works: the field takes
 * any URL, so an upload to our bucket overrides the file without a deploy.
 *
 * The -2 suffixes are not decoration. Optimised images are cached by URL for a
 * month (see minimumCacheTTL in next.config.mjs), so editing a file in place
 * leaves every browser that has already seen it showing the old one. Changing
 * the name is the only thing a cache cannot ignore — so a corrected logo gets
 * a new filename rather than overwriting the old.
 */
export const DEFAULT_OEM_CLIENTS: OemClientsBlock = {
  eyebrow: "PRIVATE LABEL",
  heading: "Brands we manufacture for",
  caption:
    "Sanitary napkins and diapers produced to specification and packed under our clients' own brands.",
  is_active: true,
  clients: [
    { name: "Trent Limited", logo_url: "/images/oem/trent.png" },
    { name: "Flipkart", logo_url: "/images/oem/flipkart-2.png" },
    { name: "ONGC", logo_url: "/images/oem/ongc.png" },
    { name: "Astral Pipes", logo_url: "/images/oem/astral-2.png" },
  ],
};

/** Fills in anything a saved record is missing, so the band never renders half-empty. */
export function withOemClientDefaults(saved: Partial<OemClientsBlock> | null): OemClientsBlock {
  if (!saved) return DEFAULT_OEM_CLIENTS;
  return {
    eyebrow: saved.eyebrow ?? DEFAULT_OEM_CLIENTS.eyebrow,
    heading: saved.heading ?? DEFAULT_OEM_CLIENTS.heading,
    caption: saved.caption ?? DEFAULT_OEM_CLIENTS.caption,
    is_active: saved.is_active ?? true,
    // An explicitly empty list is a real choice — "remove them all" — so it is
    // honoured rather than quietly refilled from the defaults.
    clients: saved.clients ?? DEFAULT_OEM_CLIENTS.clients,
  };
}
