"use client";

import type { HeroSlide } from "@/lib/types";

/**
 * Scaled-down copy of the live hero, so a slide can be checked from the admin
 * panel without switching to the site and hunting for it in the rotation.
 *
 * Two variants, because the hero is genuinely two different designs: wide with
 * the copy on a frosted panel to the left, and — on a phone — the photo
 * full-bleed with white copy over a dark fade at the bottom.
 *
 * Uses a plain <img> rather than next/image: this shows whatever URL is
 * currently in the field, including one not yet imported into our bucket, and
 * next/image would throw on an unconfigured host.
 */
export default function SlidePreview({
  slide,
  variant = "desktop",
}: {
  slide: Partial<HeroSlide>;
  variant?: "desktop" | "mobile";
}) {
  const { eyebrow, headline, subheading, cta_label } = slide;
  const phone = variant === "mobile";

  // The phone falls back to the desktop picture, exactly as the hero does.
  const mediaUrl = phone ? slide.mobile_media_url || slide.media_url : slide.media_url;
  const mediaType = phone
    ? slide.mobile_media_url
      ? slide.mobile_media_type
      : slide.media_type
    : slide.media_type;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-navy">{phone ? "On a phone" : "On a computer"}</span>
        {!phone && <span className="text-[11px] text-muted-2">Approximate — actual size varies by screen</span>}
      </div>

      <div
        className={`relative overflow-hidden rounded-xl border border-border bg-[#F5E1EA] ${
          phone ? "w-[168px] aspect-[366/560]" : "aspect-[16/9]"
        }`}
      >
        {mediaUrl ? (
          mediaType === "video" ? (
            <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs text-muted-2">
            Add media to see the preview
          </div>
        )}

        {phone ? (
          <>
            {/* Mirrors the scrim the phone hero lays under its copy */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,38,60,0.92)_0%,rgba(12,38,60,0.72)_38%,rgba(12,38,60,0.12)_72%,transparent_100%)]" />
            <div className="relative h-full flex flex-col justify-end gap-1.5 p-2.5">
              {eyebrow && (
                <span className="self-start bg-pink text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full truncate max-w-full">
                  {eyebrow}
                </span>
              )}
              <p className="text-[11px] leading-[1.32] font-extrabold text-white line-clamp-3">
                {headline || "Headline"}
              </p>
              {subheading && <p className="text-[7px] leading-snug text-[#E3ECF4] line-clamp-2">{subheading}</p>}
              {cta_label && (
                <span className="self-stretch text-center bg-white text-navy text-[7px] font-bold px-2 py-1 rounded">
                  {cta_label}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Mirrors the frosted panel on the live hero */}
            <div className="absolute inset-y-0 left-0 w-[43%] backdrop-blur-md bg-white/60 [mask-image:linear-gradient(to_right,black_70%,transparent_100%)]" />
            <div className="relative h-full flex flex-col justify-center gap-1.5 px-4 max-w-[40%]">
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
                <span className="self-start bg-blue text-white text-[8px] font-semibold px-2 py-1 rounded">
                  {cta_label}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
