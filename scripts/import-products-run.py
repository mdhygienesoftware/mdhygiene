"""
Second half of the import: copy the chosen photographs into the site and write
the SQL that replaces the catalogue.

Reads import-plan.json, produced by import-products.py.

Descriptions are composed from what the sheet actually says — brand, form,
pack count, sizes — and nothing else. The sheet carries no marketing copy and
no pricing, so none is invented here; a sentence that states the pack is
honest, and whoever knows the product can write something better in the admin
panel.
"""

import json
import os
import re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_IMAGES = os.path.join(ROOT, "frontend", "public", "images", "products")
PLAN = os.path.join(ROOT, "import-plan.json")
SQL_OUT = os.path.join(ROOT, "import-products.sql")

# Wide enough for the product detail page on a retina screen; these are
# packshots on flat backgrounds, so they compress well at this size.
MAX_SIZE = (900, 900)

SIZE_ORDER = {"Small": 1, "Medium": 2, "Large": 3, "Extra Large": 4,
              "235mm": 1, "280mm": 2, "320mm": 3}


def pack_count(name):
    """'Baby Diaper Pants - (50 Pieces)' -> '50 Pcs'; 'Maxi Dry (XL) 18 Pads' -> '18 Pads'."""
    m = re.search(r"\((\d+)\s*Pieces\)", name, re.I)
    if m:
        return f"{m.group(1)} Pcs"
    m = re.search(r"(\d+\s*\+\s*\d+|\d+)\s*Pads", name, re.I)
    if m:
        return f"{m.group(1).replace(' ', '')} Pads"
    m = re.search(r"(\d+)\s*\+\s*(\d+)\s*$", name)
    if m:
        return f"{m.group(1)}+{m.group(2)} Pads"
    return None


def describe(p):
    brand = p["brand"]
    pack = pack_count(p["name"])
    sizes = [v["size_label"] for v in p["variants"]]
    sizes.sort(key=lambda s: SIZE_ORDER.get(s, 99))

    if p["category"] == "Baby Diapers":
        form = "Pant-style baby diapers"
        size_txt = ", ".join(sizes[:-1]) + " and " + sizes[-1] if len(sizes) > 1 else sizes[0]
        bits = [f"{form} from {brand}"]
        if pack:
            bits.append(f"{pack} per pack")
        bits.append(f"available in {size_txt}" if len(sizes) > 1 else f"size {size_txt}")
    else:
        bits = [f"Sanitary napkins from {brand}"]
        if pack:
            bits.append(f"{pack} per pack")
        bits.append(f"{sizes[0]} length" if sizes else "")
    return ", ".join(b for b in bits if b) + "."


def sql_str(v):
    if v is None:
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def main():
    plan = json.load(open(PLAN, encoding="utf-8"))
    os.makedirs(OUT_IMAGES, exist_ok=True)

    statements = []
    statements.append("-- Replaces the catalogue with the supplied spreadsheet.")
    statements.append("-- Previous contents backed up to")
    statements.append("-- supabase/backups/products-before-import-2026-09-29.json")
    statements.append("")
    statements.append("delete from public.product_variants;")
    statements.append("delete from public.products;")
    statements.append("")

    for order, p in enumerate(plan, 1):
        # --- the photograph
        target_name = f"{p['slug']}.jpg"
        im = Image.open(p["image_source"])
        if im.mode in ("RGBA", "LA", "P"):
            flat = Image.new("RGB", im.size, (255, 255, 255))
            im = im.convert("RGBA")
            flat.paste(im, mask=im.split()[3] if im.mode == "RGBA" else None)
            im = flat
        else:
            im = im.convert("RGB")
        im.thumbnail(MAX_SIZE, Image.LANCZOS)
        im.save(os.path.join(OUT_IMAGES, target_name), "JPEG", quality=86, optimize=True)

        image_url = f"/images/products/{target_name}"
        description = describe(p)
        brand = p["brand_slug"]
        category = p["category_slug"]

        statements.append(
            "insert into public.products "
            "(slug, name, description, features, badges, image_url, catalog_type, "
            " is_active, is_featured, sort_order, brand_id, category_id) values ("
            f"{sql_str(p['slug'])}, {sql_str(p['brand'] + ' ' + p['name'])}, {sql_str(description)}, "
            "'{}', '{}', "
            f"{sql_str(image_url)}, 'own_brand', true, false, {order}, "
            + (f"(select id from public.brands where slug = {sql_str(brand)})" if brand else "null")
            + ", "
            + (f"(select id from public.product_categories where slug = {sql_str(category)})" if category else "null")
            + ");"
        )

        variants = sorted(p["variants"], key=lambda v: SIZE_ORDER.get(v["size_label"], 99))
        pack = pack_count(p["name"])
        for i, v in enumerate(variants, 1):
            statements.append(
                "insert into public.product_variants "
                "(product_id, size_label, pack_count, sku, stock_status, sort_order) values ("
                f"(select id from public.products where slug = {sql_str(p['slug'])}), "
                f"{sql_str(v['size_label'])}, {sql_str(pack)}, {sql_str(v['sku'])}, 'in_stock', {i});"
            )
        statements.append("")

    with open(SQL_OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(statements))

    total_variants = sum(len(p["variants"]) for p in plan)
    size_kb = sum(os.path.getsize(os.path.join(OUT_IMAGES, f)) for f in os.listdir(OUT_IMAGES)) / 1024
    print(f"  images written: {len(plan)} files, {size_kb:.0f} KB total")
    print(f"  sql written:    {len(plan)} products, {total_variants} variants -> import-products.sql")
    print()
    print("  sample description:")
    print(f"    {describe(plan[0])}")
    print(f"    {describe(plan[3])}")


if __name__ == "__main__":
    main()
