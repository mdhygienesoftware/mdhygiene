import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { mailHref, mapLinkHref, telHref } from "@/lib/contact-links";
import StructuredData, { contactPageSchema } from "@/components/StructuredData";
import { getContactInfo } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

export const metadata = {
  title: "Get a Quote — MDHygiene",
  description:
    "Request distributor pricing, OEM and private-label quotes or government tender enquiries from M.D. Hygiene, Surat. Factory and corporate office details, phone and email.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [contact, general] = await Promise.all([getContactInfo(), getSeoGeneral()]);
  const siteUrl = resolveSiteUrl(general.canonical_domain);

  return (
    <>
      <StructuredData
        data={contactPageSchema(siteUrl, { phones: contact?.phones, email: contact?.email })}
      />
      <Header />
      <main className="px-5 md:px-14 py-8 md:py-12 grid md:grid-cols-2 gap-9 md:gap-12 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">Get a quote</h1>
          <p className="text-muted-2">
            Tell us about your distribution, private label, or tender requirement and our team will follow
            up with pricing and MOQs.
          </p>
          <div className="flex flex-col gap-1 text-sm text-muted mt-4">
            <span className="font-bold text-navy">Call</span>
            {contact?.phones?.map((p) => (
              <a key={p} href={telHref(p)} className="text-blue font-semibold w-fit hover:text-pink transition-colors">
                {p}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted">
            <span className="font-bold text-navy">Email</span>
            {contact?.email && (
              <a href={mailHref(contact.email)} className="text-blue font-semibold w-fit break-all hover:text-pink transition-colors">
                {contact.email}
              </a>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted">
            <span className="font-bold text-navy">Factory</span>
            <span>{contact?.factory_address}</span>
            {contact?.factory_address && (
              <a
                href={mapLinkHref(contact.factory_address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue font-semibold w-fit hover:text-pink transition-colors"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
