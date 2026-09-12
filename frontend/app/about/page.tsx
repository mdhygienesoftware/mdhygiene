import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Certifications from "@/components/Certifications";
import VideoSection from "@/components/VideoSection";
import { getAboutContent, getCertifications, getSiteVideos } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "About — MDHygiene" };

export default async function AboutPage() {
  const [about, certifications, videos] = await Promise.all([
    getAboutContent(),
    getCertifications(),
    getSiteVideos(),
  ]);

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <section className="px-5 md:px-14 py-10 md:py-14 max-w-3xl flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">ABOUT US</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-tight">{about?.heading}</h1>
          <p className="text-muted-2 leading-relaxed whitespace-pre-line">{about?.body}</p>
          <p className="text-navy font-semibold leading-relaxed">{about?.mission}</p>
        </section>

        {/* The addresses used to be repeated here; the footer carries them on
            every page, each with its own map. */}
        <VideoSection video={videos.about} />

        <Certifications names={certifications} />
      </main>
      <Footer />
    </>
  );
}
