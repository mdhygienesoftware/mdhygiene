import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getContactInfo } from "@/lib/queries";
import { activeCertifications, type Certification } from "@/lib/certifications";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Certifications — MDHygiene",
  description:
    "Every certification behind M.D. Hygiene's manufacturing — BIS, ISO 13485, WHO-GMP, CE, ISO 9001, 14001, 27001 and more — with issuing body, certificate number, scope and validity.",
};

export default async function CertificationsPage() {
  const contact = await getContactInfo();
  const certifications = activeCertifications();
  const featured = certifications.filter((c) => c.featured);
  const rest = certifications.filter((c) => !c.featured);

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <section className="px-5 md:px-14 py-8 md:py-12 max-w-3xl flex flex-col gap-5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">CERTIFICATIONS</span>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-[1.18]">
            Certified manufacturing you can put in a tender file
          </h1>
          <p className="text-muted-2 leading-relaxed">
            Hygiene products are worn against skin, bought in bulk and often supplied into government and
            institutional contracts. Every one of those buyers asks the same question first: who checked
            this, and against what standard? Here is the full list — {certifications.length} certifications,
            each with its issuing body, certificate number, scope and validity.
          </p>
        </section>

        <section className="px-5 md:px-14 pb-2">
          <div className="flex gap-2.5 items-center flex-wrap">
            {certifications.map((cert) => (
              <a
                key={cert.id}
                href={`#${cert.id}`}
                className="inline-block border border-[#E7D9E0] bg-[#FDF6F9] rounded-lg px-3.5 md:px-4 py-2 md:py-2.5 text-[13px] font-bold text-navy whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:border-pink"
              >
                {cert.name}
              </a>
            ))}
          </div>
        </section>

        <section className="px-5 md:px-14 py-8 md:py-12 flex flex-col gap-8">
          <div className="flex flex-col gap-5 md:gap-6">
            <h2 className="text-[22px] md:text-[28px] font-extrabold text-navy">Headline credentials</h2>
            {featured.map((cert, i) => (
              <Reveal key={cert.id} delay={i * 70}>
                <CertificationCard cert={cert} />
              </Reveal>
            ))}
          </div>

          {rest.length > 0 && (
            <div className="flex flex-col gap-5 md:gap-6">
              <h2 className="text-[22px] md:text-[28px] font-extrabold text-navy">
                Management systems and product standards
              </h2>
              {rest.map((cert, i) => (
                <Reveal key={cert.id} delay={i * 60}>
                  <CertificationCard cert={cert} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <section className="px-5 md:px-14 py-8 md:py-12 bg-cream-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-[24px] md:text-[30px] font-extrabold text-navy leading-[1.18]">
              Need the certificates themselves?
            </h2>
            <p className="text-[15px] leading-relaxed text-muted-2">
              We send signed copies, test reports and product specifications on request — including the
              documentation packs institutional buyers and tender committees ask for.
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

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <article
      id={cert.id}
      className="bg-white border border-border rounded-2xl p-7 md:p-9 flex flex-col md:flex-row gap-7 md:gap-9 scroll-mt-24"
    >
      {/* Scan of the certificate. Opens full size in a new tab, so a buyer can
          read the numbers off the document rather than take our word for it. */}
      <a
        href={cert.previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group shrink-0 self-start w-full max-w-[220px] md:w-[200px] mx-auto md:mx-0"
      >
        <span className="block relative aspect-[1000/1350] overflow-hidden rounded-xl border border-border bg-[#F7F3EF] transition-shadow duration-200 group-hover:shadow-[0_10px_28px_rgba(18,58,92,0.14)]">
          <Image
            src={cert.previewUrl}
            alt={`${cert.name} certificate for M.D. Hygiene`}
            fill
            sizes="220px"
            className="object-cover object-top"
          />
        </span>
        <span className="mt-2 block text-center md:text-left text-[13px] font-semibold text-blue group-hover:text-pink transition-colors">
          View certificate →
        </span>
      </a>

      <div className="flex-1 flex flex-col gap-5 min-w-0">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-xl md:text-2xl font-extrabold text-navy">{cert.name}</h3>
            <span className="text-sm text-muted-2">{cert.fullName}</span>
          </div>
          {cert.standard && <span className="text-[13px] font-semibold text-blue">{cert.standard}</span>}
        </div>

        <div className="flex flex-col gap-3">
          <Line label="WHAT IT IS" body={cert.what} />
          <Line label="WHY IT MATTERS TO YOU" body={cert.why} />
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-5">
          <Fact term="Issued by" value={cert.issuer} />
          <Fact term="Certificate no." value={cert.certificateNumber} mono />
          <Fact term="Scope" value={cert.scope} wide />
        </dl>
      </div>
    </article>
  );
}

function Line({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold tracking-[0.12em] text-pink">{label}</span>
      <p className="text-[15px] leading-relaxed text-muted-2">{body}</p>
    </div>
  );
}

function Fact({
  term,
  value,
  mono = false,
  wide = false,
}: {
  term: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-[12px] font-bold tracking-[0.1em] text-muted uppercase">{term}</dt>
      <dd className={`text-sm text-navy leading-relaxed ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
