"use client";

import type { HeroSlide } from "@/lib/types";

/**
 * Scaled-down copy of the live hero, so a slide can be checked from the admin
 * panel without switching to the site and hunting for it in the rotation.
 *
 * Uses a plain <img> rather than next/image: this shows whatever URL is
 * currently in the field, including one not yet imported into our bucket, and
 * next/image would throw on an unconfigured host.
 */
export default function SlidePreview({ slide }: { slide: Partial<HeroSlide> }) {
  const { media_url, media_type, eyebrow, headline, subheading, cta_label } = slide;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-navy">Preview</span>
        <span className="text-[11px] text-muted-2">Approximate — actual size varies by screen</span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-[#F5E1EA] aspect-[16/9]">
        {media_url ? (
          media_type === "video" ? (
            <video src={media_url} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-2">
            Add media to see the preview
          </div>
        )}

        {/* Mirrors the frosted panel on the live hero */}
        <div className="absolute inset-y-0 left-0 w-[54%] backdrop-blur-md bg-white/60 [mask-image:linear-gradient(to_right,black_72%,transparent_100%)]" />

        <div className="relative h-full flex flex-col justify-center gap-1.5 px-4 max-w-[56%]">
          {eyebrow && (
            <span className="self-start bg-white text-pink text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm truncate max-w-full">
              {eyebrow}
            </span>
          )}
          <p className="text-[15px] leading-[1.18] font-extrabold text-navy line-clamp-2">
            {headline || "Headline"}
          </p>
          {subheading && <p className="text-[8px] leading-snug text-[#44566B] line-clamp-2">{subheading}</p>}
          {cta_label && (
            <span className="self-start bg-blue text-white text-[8px] font-semibold px-2 py-1 rounded">{cta_label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
