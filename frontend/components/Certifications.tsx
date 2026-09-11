import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { featuredCertifications, findCertification } from "@/lib/certifications";

/**
 * Homepage / about band. Shows a handful of certificates, not the full dozen —
 * a buyer scanning the page needs the headline credentials, and every
 * certification is explained in full on /certifications.
 *
 * Each one is the scan of the document rather than a badge with a name on it:
 * anyone can print "GMP Certified" on a page, and showing the certificate is
 * the part that can't be faked at a glance.
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
  const featured = (
    chosen.length ? chosen.filter((cert, i) => chosen.findIndex((c) => c.id === cert.id) === i) : featuredCertifications()
  ).slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section
      id="certifications"
      className="px-5 md:px-14 py-12 md:py-14 bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-9 lg:gap-14 border-y border-border"
    >
      <Reveal>
        <div className="flex flex-col gap-2 max-w-lg">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">CERTIFICATIONS</span>
          <h3 className="text-2xl md:text-[26px] font-extrabold text-navy">
            Certified manufacturing you can trust
          </h3>
          <span className="text-[15px] text-muted">
            Quality systems and certifications that stand up to institutional and government scrutiny.
          </span>
          <Link
            href="/certifications"
            className="mt-2 text-blue font-semibold text-[15px] w-fit hover:text-pink transition-colors"
          >
            See all certifications →
          </Link>
        </div>
      </Reveal>

      <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5 shrink-0">
        {featured.map((cert, i) => (
          <Reveal key={cert.id} delay={i * 80}>
            <Link href={`/certifications#${cert.id}`} title={cert.fullName} className="group block">
              <span className="block relative aspect-[1000/1350] overflow-hidden rounded-xl border border-border bg-[#F7F3EF] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-pink group-hover:shadow-[0_12px_28px_rgba(18,58,92,0.14)]">
                <Image
                  src={cert.previewUrl}
                  alt={`${cert.name} certificate for M.D. Hygiene`}
                  fill
                  sizes="(max-width: 640px) 45vw, 150px"
                  className="object-cover object-top"
                />
              </span>
              <span className="mt-2 block text-center text-[13px] font-bold text-navy group-hover:text-pink transition-colors">
                {cert.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
