"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { deleteProductAction } from "@/lib/admin-actions";
import type { Brand } from "@/lib/types";
import { isRenderableImage } from "@/lib/image";

export interface AccordionProduct {
  id: string;
  name: string;
  brand_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  category_name: string | null;
}

export default function BrandProductsAccordion({
  brands,
  products,
}: {
  brands: Brand[];
  products: AccordionProduct[];
}) {
  // Collapsed by default — the brand list is the index, products open on click.
  const [openId, setOpenId] = useState<string | null>(null);

  const unassigned = products.filter((p) => !p.brand_id);
  const rows: { key: string; brand: Brand | null; items: AccordionProduct[] }[] = brands.map((brand) => ({
    key: brand.id,
    brand,
    items: products.filter((p) => p.brand_id === brand.id),
  }));
  if (unassigned.length) rows.push({ key: "unassigned", brand: null, items: unassigned });

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ key, brand, items }) => {
        const isOpen = openId === key;
        const accent = brand?.accent_color ?? "#8A7B73";

        return (
          <div key={key} className="rounded-2xl border border-border bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : key)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[#FBF9F6] transition-colors"
              style={{ borderLeft: `4px solid ${accent}` }}
            >
              {isRenderableImage(brand?.logo_url) ? (
                <Image src={brand.logo_url} alt={brand.name} width={200} height={80} className="h-10 w-auto max-w-[130px] object-contain" />
              ) : (
                <span className="h-10 flex items-center font-extrabold text-navy">{brand?.name ?? "Unassigned"}</span>
              )}
              <div className="flex-1">
                <p className="font-extrabold text-navy leading-tight">{brand?.name ?? "Unassigned"}</p>
                <p className="text-xs text-muted-2">
                  {items.length} product{items.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border">
                {items.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-2">No products under this brand yet.</p>
                ) : (
                  items.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="font-bold text-navy">{p.name}</p>
                        <p className="text-xs text-muted-2">
                          {p.category_name ?? "No category"} · {p.is_active ? "Active" : "Hidden"}
                          {p.is_featured ? " · Featured" : ""}
                        </p>
                      </div>
                      <Link href={`/admin/products/${p.id}`} className="text-sm font-semibold text-blue">
                        Manage
                      </Link>
                      <form action={deleteProductAction.bind(null, p.id)}>
                        <button type="submit" className="text-sm font-semibold text-red-600">
                          Delete
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
