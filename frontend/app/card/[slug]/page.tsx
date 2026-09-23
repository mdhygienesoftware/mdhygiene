import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrands, getCardMembers, getContactInfo, getSocialLinks, getTeamMemberBySlug } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import StructuredData from "@/components/StructuredData";
import CardActions from "@/components/CardActions";
import SocialIcon from "@/components/SocialIcons";
import CardHeader from "@/components/CardHeader";
import CardBackdrop from "@/components/CardBackdrop";
import type { TeamMember } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

/**
 * Pre-render every card at build time, so the first visitor to one is served
 * a finished page instead of waiting on a round trip to Supabase. Anything
 * added afterwards is still rendered on demand and cached from then on.
 *
 * An empty list is a valid answer: if Supabase is unreachable during the
 * build, the pages fall back to on-demand rendering rather than failing it.
 */
export async function generateStaticParams() {
    const members = await getCardMembers();
  return members.filter((member) => member.slug).map((member) => ({ slug: String(member.slug) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const member = (await getTeamMemberBySlug(params.slug)) as TeamMember | null;
  if (!member) return {};

  // The global title template already appends the company name.
  const title = `${member.name}${member.designation ? ` — ${member.designation}` : ""}`;
  const description = member.intro ?? `${member.name} at M.D. Hygiene Private Limited.`;

  return {
    title,
    description,
    alternates: { canonical: `/card/${member.slug}` },
    /**
     * Kept out of search results.
     *
     * A card is one person's work email, phone and WhatsApp on a single page.
     * It is meant to be handed over — scanned from a printed card, sent in a
     * message — not found by someone searching. Indexed, the whole team's
     * contact details are one scrape away.
     *
     * Nothing about the page changes: the link works, the QR code works, and
     * `follow` still lets a crawler use the links on it. It simply does not
     * appear in results.
     */
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/card/${member.slug}`,
      images: member.photo_url ? [{ url: member.photo_url }] : undefined,
    },
  };
}

export default async function DigitalCardPage({ params }: { params: { slug: string } }) {
  const [member, contact, social, brands, general] = await Promise.all([
    getTeamMemberBySlug(params.slug) as Promise<TeamMember | null>,
    getContactInfo(),
    getSocialLinks(),
    getBrands(),
    getSeoGeneral(),
  ]);
  if (!member) return notFound();
  const siteUrl = resolveSiteUrl(general.canonical_domain);

  // Person schema so the card is machine-readable too.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.designation ?? undefined,
    image: member.photo_url ?? undefined,
    email: member.email ?? undefined,
    telephone: member.phone ?? undefined,
    url: `${siteUrl}/card/${member.slug}`,
    worksFor: { "@type": "Organization", name: "M.D. Hygiene Private Limited", url: siteUrl },
  };

  const socials = [
    { key: "facebook", label: "Facebook", href: social.facebook, color: "#1877F2" },
    { key: "instagram", label: "Instagram", href: social.instagram, color: "#E4405F" },
    { key: "youtube", label: "YouTube", href: social.youtube, color: "#FF0000" },
    { key: "twitter", label: "X / Twitter", href: social.twitter, color: "#0F1419" },
  ].filter((s) => Boolean(s.href));

  return (
    <>
      <StructuredData data={personSchema} />
      <main className="relative min-h-screen py-8 px-4">
        <CardBackdrop />
        <div className="relative z-10 max-w-[440px] mx-auto flex flex-col gap-5">
          {/* Card */}
          <section className="relative bg-white rounded-[28px] shadow-[0_10px_44px_rgba(18,58,92,0.14)] overflow-hidden">
            <CardHeader />

            <div className="px-6 pb-7 -mt-16 relative z-10 flex flex-col items-center text-center gap-1">
              <div className="w-28 h-28 rounded-full ring-4 ring-white overflow-hidden bg-[#F5E1EA] relative shadow-md">
                {isRenderableImage(member.photo_url) ? (
                  <Image src={member.photo_url} alt={member.name} fill priority className="object-cover object-top" sizes="112px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-pink/60">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-navy mt-3">{member.name}</h1>
              {member.designation && <p className="text-pink font-semibold">{member.designation}</p>}
              <p className="text-sm text-muted-2">M.D. Hygiene Pvt Ltd</p>
              {member.intro && <p className="text-sm text-muted-2 leading-relaxed mt-2">{member.intro}</p>}

              {/* Social row only — email/call/WhatsApp live on their own buttons below. */}
              <div className="flex justify-center gap-2.5 mt-4">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    title={s.label}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                    style={{ background: s.color }}
                  >
                    <SocialIcon name={s.key} />
                  </a>
                ))}
              </div>

              <CardActions member={member} />
            </div>
          </section>

          {/* Company details */}
          <section className="bg-white border border-white/60 rounded-2xl p-6 flex flex-col gap-3 shadow-[0_4px_20px_rgba(18,58,92,0.06)]">
            <h2 className="font-extrabold text-navy">Company</h2>
            <dl className="text-sm flex flex-col gap-2.5">
              {contact?.corporate_address && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Corporate office</dt>
                  <dd className="text-navy">{contact.corporate_address}</dd>
                </div>
              )}
              {contact?.factory_address && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Manufacturing unit</dt>
                  <dd className="text-navy">{contact.factory_address}</dd>
                </div>
              )}
              {contact?.email && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Email</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} className="text-blue font-semibold">{contact.email}</a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Brands */}
          {brands.length > 0 && (
            <section className="bg-white border border-white/60 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgba(18,58,92,0.06)]">
              <h2 className="font-extrabold text-navy">Our brands</h2>
              <div className="grid grid-cols-2 gap-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="border border-border rounded-xl p-3 flex items-center justify-center h-16 hover:border-pink transition-colors"
                  >
                    {isRenderableImage(brand.logo_url) ? (
                      <Image src={brand.logo_url} alt={brand.name} width={220} height={90} className="max-h-9 w-auto max-w-[110px] object-contain" />
                    ) : (
                      <span className="font-bold text-navy text-sm">{brand.name}</span>
                    )}
                  </Link>
                ))}
              </div>
              <Link href="/products" className="text-blue font-semibold text-sm">View full catalog →</Link>
            </section>
          )}

          <div className="text-center pb-6">
            <Link href="/" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              mdhygiene.in
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
