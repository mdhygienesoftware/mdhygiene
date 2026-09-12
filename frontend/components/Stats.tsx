import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import type { CompanyStats } from "@/lib/types";

export default function Stats({ stats }: { stats: CompanyStats | null }) {
  const items = [
    { value: stats?.years_in_market ?? "10+", label: "Years in the hygiene market", color: "text-blue" },
    { value: stats?.distributors ?? "500+", label: "Distributors across India", color: "text-blue" },
    { value: stats?.employees ?? "100+", label: "Employees", color: "text-blue" },
    { value: stats?.reach ?? "PAN India", label: "Distribution + global exports", color: "text-pink" },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 bg-white border-y border-border">
      {items.map((stat, i) => (
        <Reveal
          key={stat.label}
          delay={i * 90}
          // Two columns on a phone, so the cells need a grid of rules; four in a
          // row from md up, where only the dividers between them apply.
          className={[
            "px-5 md:px-8 py-[18px] md:py-7 border-[#F5EBE4]",
            // Right divider: every left-hand cell on a phone, every cell but
            // the last in the md row. Stated as one class per cell so no two
            // border utilities ever land on the same element.
            i === items.length - 1 ? "" : i % 2 === 0 ? "border-r" : "md:border-r",
            // Bottom divider closes the first phone row only.
            i < items.length - 2 ? "border-b md:border-b-0" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex flex-col gap-1">
            <CountUp
              value={stat.value}
              className={`text-2xl md:text-[34px] font-extrabold tabular-nums ${stat.color}`}
            />
            <span className="text-xs md:text-sm text-muted">{stat.label}</span>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
