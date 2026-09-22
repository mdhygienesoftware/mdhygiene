import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Certifications from "@/components/Certifications";
import VideoSection from "@/components/VideoSection";
import GallerySection from "@/components/GallerySection";
import StructuredData, { aboutPageSchema } from "@/components/StructuredData";
import { getAboutContent, getCertifications, getSiteGalleries, getSiteVideos } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

export const metadata = {
  title: "About — MDHygiene",
  description:
    "M.D. Hygiene has manufactured sanitary napkins and baby diapers in Surat, Gujarat since 2016 — four own brands, OEM and private-label lines, and a distributor network across India.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [about, certifications, videos, galleries, general] = await Promise.all([
    getAboutContent(),
    getCertifications(),
    getSiteVideos(),
    getSiteGalleries(),
    getSeoGeneral(),
  ]);

  return (
    <>
      <StructuredData
        data={aboutPageSchema(resolveSiteUrl(general.canonical_domain), about?.body ?? "")}
      />
      <Header />
      <main className="flex flex-col">
        {/* Heading first, the text under it, both across the width of the
            page — the block used to be capped at 768px and left a wide screen
            mostly empty. */}
        <section className="px-5 md:px-14 py-8 md:py-12 flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">ABOUT US</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-tight text-balance">
            {about?.heading}
          </h1>
          <p className="text-muted-2 leading-relaxed whitespace-pre-line">{about?.body}</p>
          <p className="text-navy font-semibold leading-relaxed">{about?.mission}</p>
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
