import Reveal from "@/components/Reveal";
import type { VideoBlock } from "@/lib/types";
import { youTubeEmbedSrc, youTubeId } from "@/lib/video";

/**
 * A YouTube video section, filled in from Admin → Site content.
 *
 * Renders nothing at all when the block is switched off or the link isn't a
 * YouTube URL we can embed — an empty band with a broken frame in it is worse
 * than no band.
 */
export default function VideoSection({ video }: { video: VideoBlock | null }) {
  if (!video?.is_active) return null;
  const id = youTubeId(video.url);
  if (!id) return null;

  return (
    <section className="px-5 md:px-14 py-10 md:py-16 flex flex-col gap-6 md:gap-8">
      {(video.eyebrow || video.heading) && (
        <Reveal>
          <div className="flex flex-col gap-2 max-w-2xl">
            {video.eyebrow && (
              <span className="text-[13px] font-bold tracking-[0.14em] text-pink">{video.eyebrow}</span>
            )}
            {video.heading && (
              <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy leading-[1.2]">
                {video.heading}
              </h2>
            )}
            {video.caption && (
              <p className="text-[15px] md:text-base leading-relaxed text-muted-2">{video.caption}</p>
            )}
          </div>
        </Reveal>
      )}

      {/* Not wrapped in Reveal: that holds its children at opacity 0 until an
          IntersectionObserver fires, which makes "the video never appeared" a
          reachable state for a section that is nothing but the video.
          Capped to the same width as the image carousel, and a 16:9 box rather
          than a fixed height — YouTube's own ratio, so the player fills it with
          no bars at the sides. */}
      <div className="w-full max-w-3xl">
        <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-border bg-navy">
          <iframe
            src={youTubeEmbedSrc(id)}
            title={video.heading || "M.D. Hygiene video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
