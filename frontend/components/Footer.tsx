import Link from "next/link";
import { getContactInfo, getFooterTagline } from "@/lib/queries";
import { mailHref, telHref } from "@/lib/contact-links";
import AddressMap from "@/components/AddressMap";

export default async function Footer() {
  const [contact, tagline] = await Promise.all([getContactInfo(), getFooterTagline()]);

  return (
    <footer className="bg-navy px-5 md:px-14 py-12 md:py-14 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-12">
        <div className="flex flex-col gap-3.5 max-w-[380px]">
          <span className="font-extrabold text-lg text-white">M.D. HYGIENE PVT. LTD.</span>
          <span className="text-sm leading-relaxed text-[#9DB4C8]">
            Manufacturer of sanitary napkins &amp; baby diapers. Surat, Gujarat, India —
            serving PAN India distributors and export markets since 2016.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:flex md:flex-wrap md:gap-16">
          {contact?.factory_address && <AddressMap label="FACTORY" address={contact.factory_address} />}
          {contact?.corporate_address && (
            <AddressMap label="CORPORATE OFFICE" address={contact.corporate_address} />
          )}
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">CONTACT</span>
            {contact?.phones.map((p) => (
              <a key={p} href={telHref(p)} className="hover:text-white transition-colors w-fit">
                {p}
              </a>
            ))}
            {contact?.email && (
              <a href={mailHref(contact.email)} className="hover:text-white transition-colors w-fit break-all">
                {contact.email}
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">COMPANY</span>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/certifications" className="hover:text-white transition-colors">Certifications</Link>
            <Link href="/careers" className="hover:text-white transition-colors">Careers</Link>
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Get a Quote</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 text-center text-sm text-[#7C93AB]">
        {tagline?.text ?? "M.D. Hygiene — Caring for Hygiene, Caring for You"}
      </div>
    </footer>
  );
}
