import ImageCarousel from "@/components/ImageCarousel";
import Reveal from "@/components/Reveal";
import { isRenderableImage } from "@/lib/image";
import type { GalleryBlock } from "@/lib/types";

/**
 * An image carousel section, filled in from Admin → Gallery.
 *
 * Images whose URL we can't serve are dropped rather than rendered, since
 * next/image throws on an unconfigured host and would take the page with it;
 * the section disappears entirely if that leaves nothing.
 */
export default function GallerySection({ gallery }: { gallery: GalleryBlock | null }) {
  if (!gallery?.is_active) return null;

  const images = gallery.images.filter((image) => isRenderableImage(image.url));
  if (images.length === 0) return null;

  return (
    <section className="px-5 md:px-14 py-10 md:py-16 flex flex-col gap-6 md:gap-8">
      {(gallery.eyebrow || gallery.heading) && (
        <Reveal>
          <div className="flex flex-col gap-2 max-w-2xl">
            {gallery.eyebrow && (
              <span className="text-[13px] font-bold tracking-[0.14em] text-pink">{gallery.eyebrow}</span>
            )}
            {gallery.heading && (
              <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy leading-[1.2]">
                {gallery.heading}
              </h2>
            )}
            {gallery.caption && (
              <p className="text-[15px] md:text-base leading-relaxed text-muted-2">{gallery.caption}</p>
            )}
          </div>
        </Reveal>
      )}

      {/* Not wrapped in Reveal. That holds its children at opacity 0 until an
          IntersectionObserver fires, which makes "the images never appeared"
          a possible outcome for a section whose whole point is the images. */}
      {/* Capped rather than full-bleed: at section width the 16:9 box was
          over 700px tall on a desktop and dominated the page. */}
      <div className="w-full max-w-3xl mx-auto">
        <ImageCarousel images={images} />
      </div>
    </section>
  );
}
