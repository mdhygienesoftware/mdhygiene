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
    <section className="px-6 md:px-14 py-16 md:py-20 bg-cream-2 flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold tracking-[0.14em] text-pink">WORK WITH US</span>
        <h2 className="text-3xl md:text-[36px] font-extrabold text-navy">
          One factory. Three ways to partner.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {SEGMENTS.map((s) => (
          <div key={s.n} className="bg-white rounded-2xl p-8 flex flex-col gap-3">
            <span className="text-[13px] font-mono text-pink">{s.n}</span>
            <h3 className="text-xl font-bold text-navy">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted-2">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
