import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Certifications from "@/components/Certifications";
import { getAboutContent, getCertifications, getContactInfo } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "About — MDHygiene" };

export default async function AboutPage() {
  const [about, certifications, contact] = await Promise.all([getAboutContent(), getCertifications(), getContactInfo()]);

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <section className="px-6 md:px-14 py-14 max-w-3xl flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">ABOUT US</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-tight">{about?.heading}</h1>
          <p className="text-muted-2 leading-relaxed whitespace-pre-line">{about?.body}</p>
          <p className="text-navy font-semibold leading-relaxed">{about?.mission}</p>
        </section>

        <Certifications certifications={certifications ?? []} />

        <section className="px-6 md:px-14 py-14 grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2">
            <h3 className="text-lg font-extrabold text-navy">Factory</h3>
            <p className="text-muted-2 text-sm leading-relaxed">{contact?.factory_address}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2">
            <h3 className="text-lg font-extrabold text-navy">Corporate Office</h3>
            <p className="text-muted-2 text-sm leading-relaxed">{contact?.corporate_address}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
