import Link from "next/link";
import { getContactInfo, getFooterTagline } from "@/lib/queries";

export default async function Footer() {
  const [contact, tagline] = await Promise.all([getContactInfo(), getFooterTagline()]);

  return (
    <footer className="bg-navy px-6 md:px-14 py-14 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between gap-12">
        <div className="flex flex-col gap-3.5 max-w-[380px]">
          <span className="font-extrabold text-lg text-white">M.D. HYGIENE PVT. LTD.</span>
          <span className="text-sm leading-relaxed text-[#9DB4C8]">
            Manufacturer of sanitary napkins, baby diapers &amp; adult diapers. Surat, Gujarat, India —
            serving PAN India distributors and export markets since 2016.
          </span>
        </div>
        <div className="flex flex-wrap gap-12 md:gap-16">
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8] max-w-[240px]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">FACTORY</span>
            <span>{contact?.factory_address}</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8] max-w-[240px]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">CORPORATE OFFICE</span>
            <span>{contact?.corporate_address}</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">CONTACT</span>
            {contact?.phones.map((p) => <span key={p}>{p}</span>)}
            <span>{contact?.email}</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[#9DB4C8]">
            <span className="text-white font-bold text-[13px] tracking-[0.1em]">COMPANY</span>
            <Link href="/about" className="hover:text-white transition-colors">About &amp; Certifications</Link>
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
