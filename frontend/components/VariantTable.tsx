import type { Product } from "@/lib/types";

/** Sizes and pack configurations. Pricing is quoted per enquiry, not shown publicly. */
export default function VariantTable({ product }: { product: Product }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm min-w-[380px]">
        <thead>
          <tr className="bg-[#F7F3EF] text-muted uppercase text-[11px] tracking-wide">
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Pack</th>
            <th className="px-4 py-3">Pieces / Case</th>
          </tr>
        </thead>
        <tbody>
          {product.variants.map((variant) => (
            <tr key={variant.id} className="border-t border-border">
              <td className="px-4 py-3 font-semibold text-navy">{variant.size_label}</td>
              <td className="px-4 py-3 text-muted-2">{variant.pack_count ?? "—"}</td>
              <td className="px-4 py-3 text-muted-2">{variant.case_qty ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
