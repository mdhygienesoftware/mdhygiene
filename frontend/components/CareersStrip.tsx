import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { CareersContent } from "@/lib/types";

/**
 * Homepage careers band. Copy, perks and the button label come from
 * Admin → Careers; "View openings" leads to the listing and application form.
 */
export default function CareersStrip({ careers }: { careers: CareersContent }) {
  const openCount = careers.openings.filter((o) => o.is_open).length;

  return (
    <section id="careers" className="px-5 md:px-14 py-14 md:py-20 bg-navy text-white">
      <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
        <Reveal className="flex-1">
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-bold tracking-[0.14em] text-pink">{careers.eyebrow}</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold leading-[1.18] max-w-xl">
              {careers.heading}
            </h2>
            <p className="text-[15px] md:text-base leading-relaxed text-[#C3D6E7] max-w-xl">{careers.body}</p>

            <div className="flex flex-wrap items-center gap-3.5 mt-2">
              <Link
                href="/careers"
                className="bg-pink text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-navy transition-colors"
              >
                {careers.cta_label}
              </Link>
              <span className="text-sm text-[#C3D6E7]">
                {openCount > 0
                  ? `${openCount} role${openCount === 1 ? "" : "s"} open right now`
                  : "Open applications welcome"}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140} className="lg:w-[420px] shrink-0">
          <ul className="flex flex-col gap-3">
            {careers.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 bg-white/[0.07] border border-white/10 rounded-xl px-5 py-4"
              >
                <span aria-hidden className="text-pink font-bold leading-6">
                  →
                </span>
                <span className="text-[15px] leading-6 text-white/90">{perk}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
