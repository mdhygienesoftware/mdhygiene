import Link from "next/link";
import Reveal from "@/components/Reveal";
import { featuredCertifications, findCertification } from "@/lib/certifications";

/**
 * Homepage / about band. Shows a handful of marks, not the full dozen — a
 * buyer scanning the page needs the headline credentials, and every
 * certification is explained in full on /certifications.
 *
 * Which ones appear is the list in Admin → Site content, resolved against the
 * catalogue; the catalogue's own `featured` flags are the fallback when that
 * list is empty or names nothing we hold.
 */
export default function Certifications({ names }: { names?: string[] | null }) {
  const chosen = (names ?? [])
    .map(findCertification)
    .filter((cert): cert is NonNullable<typeof cert> => cert !== null);
  // De-duplicate: two stored names can resolve to the same certificate.
  const featured = chosen.length
    ? chosen.filter((cert, i) => chosen.findIndex((c) => c.id === cert.id) === i)
    : featuredCertifications();
  if (featured.length === 0) return null;

  return (
    <section
      id="certifications"
      className="px-5 md:px-14 py-12 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-y border-border"
    >
      <Reveal>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">CERTIFICATIONS</span>
          <h3 className="text-2xl md:text-[26px] font-extrabold text-navy">
            Certified manufacturing you can trust
          </h3>
          <span className="text-[15px] text-muted">
            Quality systems and certifications that stand up to institutional and government scrutiny.
          </span>
        </div>
      </Reveal>
      <div className="flex gap-3 items-center flex-wrap md:max-w-xl md:justify-end">
        {featured.map((cert, i) => (
          <Reveal key={cert.id} delay={i * 70}>
            {/* Each badge opens its own entry on the certifications page. */}
            <Link
              href={`/certifications#${cert.id}`}
              title={cert.fullName}
              className="inline-block border border-[#E7D9E0] bg-[#FDF6F9] rounded-lg px-4 md:px-[18px] py-2.5 md:py-3 text-[13px] font-bold text-navy whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:border-pink hover:text-pink"
            >
              {cert.name}
            </Link>
          </Reveal>
        ))}
        <Link href="/certifications" className="text-blue font-semibold text-[15px] whitespace-nowrap">
          See all certifications →
        </Link>
      </div>
    </section>
  );
}
