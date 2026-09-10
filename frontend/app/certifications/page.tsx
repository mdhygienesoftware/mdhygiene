import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getCertifications, getContactInfo } from "@/lib/queries";
import { certificationNote, certificationSlug } from "@/lib/certifications";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Certifications — MDHygiene",
  description:
    "The quality systems and certification marks behind M.D. Hygiene's manufacturing — what each one covers and what it means for distributors, institutional buyers and tender committees.",
};

export default async function CertificationsPage() {
  const [certifications, contact] = await Promise.all([getCertifications(), getContactInfo()]);
  const marks = certifications ?? [];

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <section className="px-5 md:px-14 py-10 md:py-14 max-w-3xl flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">CERTIFICATIONS</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-[1.18]">
            Certified manufacturing you can put in a tender file
          </h1>
          <p className="text-muted-2 leading-relaxed">
            Hygiene products are worn against skin, bought in bulk and often supplied into government and
            institutional contracts. Every one of those buyers asks the same question first: who checked
            this, and against what standard? These are the marks our manufacturing is held to, and what
            each of them actually covers.
          </p>
        </section>

        {marks.length > 0 && (
          <section className="px-5 md:px-14 pb-2">
            <div className="flex gap-3 items-center flex-wrap">
              {marks.map((mark) => (
                <a
                  key={mark}
                  href={`#${certificationSlug(mark)}`}
                  className="inline-block border border-[#E7D9E0] bg-[#FDF6F9] rounded-lg px-4 md:px-[18px] py-2.5 md:py-3 text-[13px] font-bold text-navy whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:border-pink"
                >
                  {mark}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="px-5 md:px-14 py-10 md:py-14 flex flex-col gap-5 md:gap-6">
          {marks.length === 0 ? (
            <p className="text-muted-2">
              Certifications are managed in the admin panel under Site content.
            </p>
          ) : (
            marks.map((mark, i) => {
              const note = certificationNote(mark);
              return (
                <Reveal key={mark} delay={i * 80}>
                  <article
                    id={certificationSlug(mark)}
                    className="bg-white border border-border rounded-2xl p-7 md:p-9 flex flex-col gap-4 scroll-mt-24"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h2 className="text-xl md:text-2xl font-extrabold text-navy">{note?.name ?? mark}</h2>
                      {note && <span className="text-sm text-muted-2">{note.fullName}</span>}
                    </div>
                    {note ? (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-bold tracking-[0.12em] text-pink">WHAT IT IS</span>
                          <p className="text-[15px] leading-relaxed text-muted-2">{note.what}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-bold tracking-[0.12em] text-pink">
                            WHY IT MATTERS TO YOU
                          </span>
                          <p className="text-[15px] leading-relaxed text-muted-2">{note.why}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-[15px] leading-relaxed text-muted-2">
                        A certification held by M.D. Hygiene. Ask our team for the current certificate and
                        its scope.
                      </p>
                    )}
                  </article>
                </Reveal>
              );
            })
          )}
        </section>

        <section className="px-5 md:px-14 py-12 md:py-16 bg-cream-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-[24px] md:text-[30px] font-extrabold text-navy leading-[1.18]">
              Need certificates for a tender or an audit?
            </h2>
            <p className="text-[15px] leading-relaxed text-muted-2">
              We supply current certificates, test reports and product specifications on request — including
              the documentation packs institutional buyers and tender committees ask for.
              {contact?.email ? ` Write to ${contact.email} or use the form.` : ""}
            </p>
          </div>
          <Link
            href="/contact"
            className="self-start shrink-0 bg-pink text-white px-8 py-4 rounded-lg font-semibold hover:bg-navy transition-colors"
          >
            Request documentation
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
