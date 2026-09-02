import Link from "next/link";

export default function Certifications({ certifications }: { certifications: string[] }) {
  return (
    <section
      id="certifications"
      className="px-6 md:px-14 py-12 bg-white flex flex-col md:flex-row items-center justify-between gap-8 border-y border-border"
    >
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold tracking-[0.14em] text-pink">CERTIFICATIONS</span>
        <h3 className="text-2xl md:text-[26px] font-extrabold text-navy">Certified manufacturing you can trust</h3>
        <span className="text-[15px] text-muted">
          Quality systems and certifications that stand up to institutional and government scrutiny.
        </span>
      </div>
      <div className="flex gap-3 items-center flex-wrap max-w-xl justify-end">
        {certifications.map((cert) => (
          <span
            key={cert}
            className="border border-[#E7D9E0] bg-[#FDF6F9] rounded-lg px-[18px] py-3 text-[13px] font-bold text-navy whitespace-nowrap"
          >
            {cert}
          </span>
        ))}
        <Link href="/about#certifications" className="text-blue font-semibold text-[15px] whitespace-nowrap">
          Learn more →
        </Link>
      </div>
    </section>
  );
}
