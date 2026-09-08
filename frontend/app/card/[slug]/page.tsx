import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrands, getContactInfo, getSocialLinks, getTeamMemberBySlug } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import StructuredData from "@/components/StructuredData";
import CardActions from "@/components/CardActions";
import SocialIcon from "@/components/SocialIcons";
import CardHeader from "@/components/CardHeader";
import CardBackdrop from "@/components/CardBackdrop";
import type { TeamMember } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    openGraph: {
      title,
      description,
      url: `/card/${member.slug}`,
      images: member.photo_url ? [{ url: member.photo_url }] : undefined,
    },
  };
}

export default async function DigitalCardPage({ params }: { params: { slug: string } }) {
  const member = (await getTeamMemberBySlug(params.slug)) as TeamMember | null;
  if (!member) return notFound();

  const [contact, social, brands, general] = await Promise.all([
    getContactInfo(),
    getSocialLinks(),
    getBrands(),
    getSeoGeneral(),
  ]);
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
          <section className="relative bg-white rounded-[28px] shadow-[0_8px_40px_rgba(18,58,92,0.10)] overflow-hidden">
            {/* Card surface: tinted brand corners, a visible dot weave and a
                diagonal sheen. Values are intentionally strong enough to see —
                earlier passes sat near 2% opacity and read as plain white. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(115% 85% at 0% 100%, rgba(228,119,159,0.42) 0%, rgba(228,119,159,0.10) 42%, transparent 68%), radial-gradient(105% 80% at 100% 92%, rgba(30,98,176,0.34) 0%, rgba(30,98,176,0.08) 42%, transparent 68%), linear-gradient(180deg, #FFFFFF 0%, #FAF6F8 45%, #EEF4FA 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(rgba(18,58,92,0.16) 1.2px, transparent 1.2px)",
                  backgroundSize: "15px 15px",
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-3/4"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 16px, rgba(18,58,92,0.06) 16px, rgba(18,58,92,0.06) 32px)",
                }}
              />
            </div>
            <CardHeader />

            <div className="px-6 pb-7 -mt-16 relative z-10 flex flex-col items-center text-center gap-1">
              <div className="w-28 h-28 rounded-full ring-4 ring-white overflow-hidden bg-[#F5E1EA] relative shadow-md">
                {member.photo_url ? (
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
          <section className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl p-6 flex flex-col gap-3 shadow-[0_4px_20px_rgba(18,58,92,0.06)]">
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
            <section className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgba(18,58,92,0.06)]">
              <h2 className="font-extrabold text-navy">Our brands</h2>
              <div className="grid grid-cols-2 gap-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="border border-border rounded-xl p-3 flex items-center justify-center h-16 hover:border-pink transition-colors"
                  >
                    {brand.logo_url ? (
                      <Image src={brand.logo_url} alt={brand.name} width={90} height={36} className="max-h-9 w-auto object-contain" />
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
            <Link href="/" className="text-sm font-semibold text-muted-2 hover:text-pink transition-colors">
              mdhygiene.in
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
