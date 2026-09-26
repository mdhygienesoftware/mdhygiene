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
 * Every logo sits in an identical white box and is contained rather than
 * cropped. Client logos never share a shape — one is a wide wordmark, another
 * is square with its own coloured background baked in — and lining them up by
 * their edges would leave one looming over the next. Matching the boxes instead
 * of the marks is what makes a row of borrowed artwork look deliberate.
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
              <div className="h-24 md:h-28 flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-4 transition-colors hover:border-pink/40">
                <Image
                  src={client.logo_url}
                  alt={`${client.name} — private-label client of M.D. Hygiene`}
                  width={220}
                  height={130}
                  // Contained inside a fixed box: the mark keeps its own
                  // proportions and the row keeps its rhythm.
                  className="max-h-full w-auto object-contain"
                  sizes="(max-width: 640px) 45vw, 220px"
                />
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
