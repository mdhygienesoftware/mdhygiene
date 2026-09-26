import Image from "next/image";
import Reveal from "@/components/Reveal";
import { isRenderableImage } from "@/lib/image";
import type { OemClientsBlock } from "@/lib/types";

/**
 * The companies M.D. Hygiene manufactures for under their own brands.
 *
 * On a private-label page this is the strongest thing on it: a buyer weighing
 * up a contract manufacturer is really asking who else trusted them, and a
 * recognised name answers that faster than any amount of copy.
 *
 * Client logos never share a shape — one is a wide wordmark, another is square
 * with its own coloured background baked in — so each sits in an identical box
 * and is contained rather than cropped, keeping its own proportions while the
 * row keeps its rhythm.
 *
 * Two of the supplied files had most of their canvas empty, which made them
 * render small beside marks that filled theirs; those were trimmed to their
 * content. The rest are as supplied.
 */
export default function OemClients({
  block,
  compact = false,
}: {
  block: OemClientsBlock;
  /** On a page that has already introduced OEM, the heading is repetition. */
  compact?: boolean;
}) {
  if (!block.is_active) return null;

  const clients = block.clients.filter((client) => isRenderableImage(client.logo_url));
  if (clients.length === 0) return null;

  return (
    <section
      className={
        compact
          ? "flex flex-col gap-5"
          : "px-5 md:px-14 py-8 md:py-12 flex flex-col gap-6 md:gap-8"
      }
    >
      {!compact && (block.eyebrow || block.heading || block.caption) && (
        <Reveal>
          <div className="flex flex-col gap-2 max-w-2xl">
            {block.eyebrow && (
              <span className="text-[13px] font-bold tracking-[0.14em] text-pink">{block.eyebrow}</span>
            )}
            {block.heading && (
              <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy leading-[1.2]">
                {block.heading}
              </h2>
            )}
            {block.caption && (
              <p className="text-[15px] md:text-base leading-relaxed text-muted-2">{block.caption}</p>
            )}
          </div>
        </Reveal>
      )}

      {compact && block.heading && (
        <h3 className="text-lg md:text-xl font-bold text-navy">{block.heading}</h3>
      )}

      {/* Two across on a phone, so each mark still has room to be read. */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {clients.map((client, i) => (
          <Reveal key={`${client.name}-${i}`} delay={i * 80} holdOnPhone>
            <li className="h-full">
              <div className="relative h-24 md:h-28 overflow-hidden rounded-2xl border border-border bg-white transition-colors hover:border-pink/40">
                {/* `fill` rather than declared dimensions. Every logo is a
                    different shape and an admin can upload another, so there
                    is no one width and height to state. Given fixed numbers,
                    the element takes that shape and object-contain then shrinks
                    the real image inside it — which is why the two widest marks
                    came out smallest. Filling the box and containing within it
                    lets each logo use the full height whatever its
                    proportions. */}
                <Image
                  src={client.logo_url}
                  alt={`${client.name} — private-label client of M.D. Hygiene`}
                  fill
                  className="object-contain p-5"
                  sizes="(max-width: 640px) 45vw, 300px"
                />
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
