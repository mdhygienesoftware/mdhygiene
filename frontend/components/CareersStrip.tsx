import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { CareersContent } from "@/lib/types";

/**
 * Homepage careers band: one line of copy, one button.
 *
 * Deliberately quiet — it sits between the certifications strip and the footer,
 * where a full section would compete with the partner CTAs above it. The detail
 * (perks, roles, the form) lives on /careers.
 *
 * Heading, subtitle and button label all come from Admin → Careers.
 */
export default function CareersStrip({ careers }: { careers: CareersContent }) {
  return (
    <section
      id="careers"
      className="px-5 md:px-14 py-10 md:py-16 bg-cream flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10"
    >
      <Reveal>
        <div className="flex flex-col gap-2 max-w-2xl">
          <h2 className="text-[26px] md:text-[30px] font-extrabold text-navy leading-[1.18]">
            {careers.heading}
          </h2>
          <p className="text-[15px] md:text-base leading-relaxed text-muted-2">{careers.body}</p>
        </div>
      </Reveal>

      <Reveal delay={120} className="shrink-0">
        <Link
          href="/careers"
          className="inline-block bg-navy text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink transition-colors"
        >
          {careers.cta_label}
        </Link>
      </Reveal>
    </section>
  );
}
