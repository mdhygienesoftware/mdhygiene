export function formatINR(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function stockLabel(status: string): { label: string; className: string } {
  switch (status) {
    case "low_stock":
      return { label: "Low stock", className: "bg-amber-50 text-amber-700" };
    case "out_of_stock":
      return { label: "Out of stock", className: "bg-red-50 text-red-600" };
    default:
      return { label: "In stock", className: "bg-emerald-50 text-emerald-700" };
  }
}
