/**
 * Turning contact details into things a phone can act on.
 *
 * The values come from site settings as display strings ("+91 73592 52000"),
 * which is what should appear on the page — but a `tel:` href has to be the
 * bare number, since spaces make some dialers ignore the link entirely.
 */

/** `tel:` link for a displayed phone number. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** `mailto:` link for a displayed address. */
export function mailHref(email: string): string {
  return `mailto:${email.trim()}`;
}

/**
 * Google Maps embed for a postal address.
 *
 * The `output=embed` form needs no API key and no billing account, which is
 * why it is used here rather than the Maps Embed API.
 */
export function mapEmbedSrc(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** The same place, opened in the Maps app or site. */
export function mapLinkHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
