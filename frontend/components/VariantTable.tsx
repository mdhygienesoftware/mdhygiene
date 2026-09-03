import { formatINR, stockLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function VariantTable({ product }: { product: Product }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm min-w-[520px]">
        <thead>
          <tr className="bg-[#F7F3EF] text-muted uppercase text-[11px] tracking-wide">
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Pack</th>
            <th className="px-4 py-3">Case Qty</th>
            <th className="px-4 py-3">MRP</th>
            <th className="px-4 py-3">Net Price</th>
            <th className="px-4 py-3">Availability</th>
          </tr>
        </thead>
        <tbody>
          {product.variants.map((variant) => {
            const stock = stockLabel(variant.stock_status);
            return (
              <tr key={variant.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-navy">{variant.size_label}</td>
                <td className="px-4 py-3 text-muted-2">{variant.pack_count ?? "—"}</td>
                <td className="px-4 py-3 text-muted-2">{variant.case_qty ?? "—"}</td>
                <td className="px-4 py-3 text-muted-2 line-through decoration-muted/40">{formatINR(variant.mrp)}</td>
                <td className="px-4 py-3 font-bold text-navy">{formatINR(variant.net_price)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${stock.className}`}>{stock.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
