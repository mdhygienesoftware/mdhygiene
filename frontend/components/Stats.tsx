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
          className={`px-5 md:px-8 py-6 md:py-7 ${i < items.length - 1 ? "md:border-r border-[#F5EBE4]" : ""}`}
        >
          <div className="flex flex-col gap-1">
            <CountUp
              value={stat.value}
              className={`text-[28px] md:text-[34px] font-extrabold tabular-nums ${stat.color}`}
            />
            <span className="text-[13px] md:text-sm text-muted">{stat.label}</span>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
