import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatusAction } from "@/lib/admin-actions";
import { ORDER_STATUSES } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import { formatINR } from "@/lib/format";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", params.id),
  ]);
  if (!order) return notFound();

  const total = (items ?? []).reduce((sum, i) => sum + (i.unit_price_snapshot ?? 0) * i.quantity, 0);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">{order.company_name}</h1>
        <StatusSelect id={order.id} value={order.status} options={ORDER_STATUSES} action={updateOrderStatusAction} />
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 grid md:grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted">Contact</span><p className="font-semibold text-navy">{order.contact_name}</p></div>
        <div><span className="text-muted">Email</span><p className="font-semibold text-navy">{order.email}</p></div>
        <div><span className="text-muted">Phone</span><p className="font-semibold text-navy">{order.phone}</p></div>
        <div><span className="text-muted">Region</span><p className="font-semibold text-navy">{order.region ?? "—"}</p></div>
        {order.notes && (
          <div className="md:col-span-2"><span className="text-muted">Notes</span><p className="text-navy">{order.notes}</p></div>
        )}
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F7F3EF] text-muted uppercase text-[11px]">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit (net)</th>
              <th className="px-4 py-3">Line total</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-navy">{item.product_name_snapshot}</td>
                <td className="px-4 py-3 text-muted-2">{item.variant_label_snapshot}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatINR(item.unit_price_snapshot)}</td>
                <td className="px-4 py-3 font-bold text-navy">{formatINR((item.unit_price_snapshot ?? 0) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex justify-end gap-2 text-sm">
          <span className="text-muted">Estimated total (net):</span>
          <span className="font-extrabold text-navy">{formatINR(total)}</span>
        </div>
      </div>
    </div>
  );
}
