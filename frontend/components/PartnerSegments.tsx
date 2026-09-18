import Reveal from "@/components/Reveal";
import MobileRail from "@/components/MobileRail";

const SEGMENTS = [
  {
    n: "01",
    title: "Distribution",
    body: "Join 500+ distributors stocking 7Soft, Extrasure and 24Care — with reliable supply and strong retail margins.",
  },
  {
    n: "02",
    title: "Private Label & OEM",
    body: "Launch your own brand of pads or diapers — we handle specification, production and packaging end-to-end.",
  },
  {
    n: "03",
    title: "Government & Tenders",
    body: "Proven capacity and compliance for government and institutional tenders, at volume and on schedule.",
  },
];

export default function PartnerSegments() {
  return (
    <section className="px-5 md:px-14 py-10 md:py-20 bg-cream-2 flex flex-col gap-7 md:gap-9">
      <Reveal>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold tracking-[0.14em] text-pink">WORK WITH US</span>
          <h2 className="text-[26px] md:text-[36px] font-extrabold text-navy">
            One factory. Three ways to partner.
          </h2>
        </div>
      </Reveal>
      <MobileRail className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-[14px] -mx-5 px-5 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-3 md:gap-6">
        {SEGMENTS.map((s, i) => (
          <Reveal key={s.n} delay={i * 130} holdOnPhone className="flex-[0_0_76%] snap-start md:flex-none">
            <div className="group h-full bg-white rounded-2xl p-7 md:p-8 flex flex-col gap-3 border border-transparent transition-all duration-300 hover:-translate-y-1 hover:border-pink/40 hover:shadow-[0_12px_30px_rgba(18,58,92,0.10)]">
              <span className="text-[13px] font-mono text-pink">{s.n}</span>
              <h3 className="text-xl font-bold text-navy">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-2">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </MobileRail>
    </section>
  );
}
