import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Certifications from "@/components/Certifications";
import VideoSection from "@/components/VideoSection";
import GallerySection from "@/components/GallerySection";
import { getAboutContent, getCertifications, getSiteGalleries, getSiteVideos } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "About — MDHygiene" };

export default async function AboutPage() {
  const [about, certifications, videos, galleries] = await Promise.all([
    getAboutContent(),
    getCertifications(),
    getSiteVideos(),
    getSiteGalleries(),
  ]);

  return (
    <>
      <Header />
      <main className="flex flex-col">
        {/* Two columns from lg: the block was capped at 768px and left half a
            wide screen empty, but running body copy the full width would give
            lines far too long to read. Heading on the left, prose on the right
            fills the space and keeps both columns a sensible measure. */}
        <section className="px-5 md:px-14 py-10 md:py-14 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 lg:gap-16 items-start">
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-bold tracking-[0.14em] text-pink">ABOUT US</span>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-tight text-balance">
              {about?.heading}
            </h1>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-muted-2 leading-relaxed whitespace-pre-line">{about?.body}</p>
            <p className="text-navy font-semibold leading-relaxed">{about?.mission}</p>
          </div>
        </section>

        {/* The addresses used to be repeated here; the footer carries them on
            every page, each with its own map. */}
        <VideoSection video={videos.about} />

        <GallerySection gallery={galleries.about} />

        <Certifications names={certifications} />
      </main>
      <Footer />
    </>
  );
}
