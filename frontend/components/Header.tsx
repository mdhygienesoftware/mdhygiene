import Image from "next/image";
import Link from "next/link";
import { getContactInfo } from "@/lib/queries";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/products#brands", label: "Brands" },
  { href: "/products?type=oem", label: "OEM / Private Label" },
  { href: "/about#certifications", label: "Certifications" },
];

export default async function Header() {
  const contact = await getContactInfo();

  return (
    <>
      <div className="hidden md:flex justify-between gap-10 bg-navy text-[#C3D6E7] text-[13px] px-14 py-2">
        <div className="flex gap-7">
          {contact?.phones?.length ? <span>Call: {contact.phones.join(" · ")}</span> : null}
          {contact?.email ? <span>{contact.email}</span> : null}
        </div>
        <div className="flex gap-5">
          <span>BIS · CE · GMP Certified</span>
          <span>Surat, Gujarat — India</span>
        </div>
      </div>

      <header className="flex items-center justify-between gap-12 px-6 md:px-14 py-3 bg-white border-b border-border sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/images/brand/mdh-logo.png" alt="M.D. Hygiene" width={48} height={48} className="rounded-full" />
          <span className="flex flex-col leading-tight">
            <span className="font-extrabold text-[17px]">M.D. HYGIENE</span>
            <span className="text-[11px] text-muted tracking-[0.14em]">PRIVATE LIMITED</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#44586B]">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-pink transition-colors">
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-pink text-white px-[22px] py-[11px] rounded-lg font-semibold hover:bg-navy transition-colors"
          >
            Get a Quote
          </Link>
        </nav>
        <div className="lg:hidden flex items-center gap-4">
          <Link href="/contact" className="bg-pink text-white px-4 py-2 rounded-lg font-semibold text-sm">
            Quote
          </Link>
        </div>
      </header>
    </>
  );
}
