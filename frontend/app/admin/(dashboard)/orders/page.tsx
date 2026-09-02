import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatusAction } from "@/lib/admin-actions";
import { ORDER_STATUSES } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">Order requests</h1>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {(orders ?? []).map((order) => (
          <div key={order.id} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
            <div className="flex-1">
              <Link href={`/admin/orders/${order.id}`} className="font-bold text-navy hover:text-pink transition-colors">
                {order.company_name} · {order.contact_name}
              </Link>
              <p className="text-sm text-muted-2">{order.email} · {order.phone}</p>
              <p className="text-xs text-muted">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <StatusSelect id={order.id} value={order.status} options={ORDER_STATUSES} action={updateOrderStatusAction} />
          </div>
        ))}
        {!orders?.length && <p className="text-muted-2 p-6">No order requests yet.</p>}
      </div>
    </div>
  );
}
