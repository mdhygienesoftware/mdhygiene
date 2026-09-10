import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CareerForm from "@/components/CareerForm";
import { getCareers } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers — MDHygiene",
  description:
    "Open roles at M.D. Hygiene — manufacturing, quality, sales and design across our Gujarat factory and distribution network. Apply online.",
};

export default async function CareersPage() {
  const careers = await getCareers();
  const open = careers.openings.filter((o) => o.is_open);

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <section className="px-5 md:px-14 py-10 md:py-14 max-w-3xl flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">{careers.eyebrow}</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-[1.18]">{careers.heading}</h1>
          <p className="text-muted-2 leading-relaxed whitespace-pre-line">{careers.body}</p>
        </section>

        <section className="px-5 md:px-14 pb-12 md:pb-16 flex flex-col gap-5 md:gap-6">
          <h2 className="text-[22px] md:text-[28px] font-extrabold text-navy">
            {open.length > 0 ? "Open positions" : "No positions listed right now"}
          </h2>

          {open.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2 max-w-2xl">
              <p className="text-[15px] leading-relaxed text-muted-2">{careers.closing_note}</p>
              <a href="#apply" className="text-blue font-semibold text-[15px] w-fit">
                Send an open application →
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {open.map((job, i) => (
                <Reveal key={job.id} delay={i * 80}>
                  <article className="bg-white border border-border rounded-2xl p-7 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex-1 flex flex-col gap-2.5">
                      <h3 className="text-xl font-extrabold text-navy">{job.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {[job.location, job.employment_type, job.experience]
                          .filter(Boolean)
                          .map((bit) => (
                            <span
                              key={bit}
                              className="text-[12px] font-bold text-navy bg-[#FDF6F9] border border-[#E7D9E0] rounded-full px-3 py-1"
                            >
                              {bit}
                            </span>
                          ))}
                      </div>
                      {job.description && (
                        <p className="text-[15px] leading-relaxed text-muted-2 whitespace-pre-line">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/careers?role=${encodeURIComponent(job.title)}#apply`}
                      className="shrink-0 self-start md:self-center bg-navy text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-pink transition-colors"
                    >
                      Apply
                    </a>
                  </article>
                </Reveal>
              ))}
              <p className="text-[15px] leading-relaxed text-muted-2 max-w-2xl">{careers.closing_note}</p>
            </div>
          )}
        </section>

        <section id="apply" className="px-5 md:px-14 py-12 md:py-16 bg-cream-2 flex flex-col gap-6 scroll-mt-20">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-navy leading-[1.18]">
              Apply to join us
            </h2>
            <p className="text-[15px] leading-relaxed text-muted-2">
              One form for every role. Pick the position you want — or send an open application and we&apos;ll
              keep you on file.
            </p>
          </div>
          <div className="max-w-2xl w-full">
            <CareerForm openings={careers.openings} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
