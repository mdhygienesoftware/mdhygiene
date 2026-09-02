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
        <div
          key={stat.label}
          className={`px-6 md:px-8 py-7 flex flex-col gap-1 ${i < items.length - 1 ? "md:border-r border-[#F5EBE4]" : ""}`}
        >
          <span className={`text-3xl md:text-[34px] font-extrabold ${stat.color}`}>{stat.value}</span>
          <span className="text-sm text-muted">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
