"""
Build the product import from the supplied spreadsheet and image folders.

The folder names cannot be trusted on their own — several contain files
branded differently from the folder (EXTRA SOFT XL 40 PAD holds files named
Extra-Sure-XL-40-...), and fuzzy name matching paired Sport Girl with a 7Soft
folder. So the mapping is written out by hand, one line per product, and
anything not listed here is treated as having no image.

Run it with --plan to print what it would do and write nothing.
"""

import json
import os
import re
import sys
import unicodedata

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "Products to import to website.xlsx")
IMAGES = os.path.join(ROOT, "Products Image")

# product name (as it appears in the sheet) -> folder / file that pictures it.
# `None` means we have no picture, and the product is skipped.
#
# "check" marks a mapping that is a judgement rather than a certainty, because
# the folder and the filenames inside it disagree about the brand. Those are
# imported and listed at the end for someone who knows the packs to confirm.
IMAGE_MAP = {
    # --- 7 Soft baby diapers. The pack count in the filename is what pins
    #     these down; the folder only says which size it is.
    ("7 Soft", "Baby Diaper Pants - (1 Pieces)"):   ("7_SOFT_DAIPER_S", "7_SOFT S-1-A.png", False),
    ("7 Soft", "Baby Diaper Pants - (24 Pieces)"):  ("7_SOFT_DAIPER_XL", "7-Soft-diaper-xl-24-pants A.png", False),
    ("7 Soft", "Baby Diaper Pants - (30 Pieces)"):  ("7_SOFT_DAIPER_L", "7_SOFT L-30-A.png", False),
    ("7 Soft", "Baby Diaper Pants - (34 Pieces)"):  ("7_SOFT_DAIPER_M", "7_SOFT M-34-A.png", False),
    ("7 Soft", "Baby Diaper Pants - (40 Pieces)"):  ("7_SOFT_DAIPER_S", "7_SOFT S-40-A.png", False),
    ("7 Soft", "Baby Diaper Pants - (50 Pieces)"):  ("7_SOFT_DAIPER_S", "7_SOFT S-50-A.jpg", False),
    # Filed under XL but named M-56. The folder is right: the sheet has 56 as
    # an XL pack and no M-56 exists.
    ("7 Soft", "Baby Diaper Pants - (56 Pieces)"):  ("7_SOFT_DAIPER_XL", "7_SOFT M-56-A.jpg", True),
    ("7 Soft", "Baby Diaper Pants - (62 Pieces)"):  ("7_SOFT_DAIPER_L", "7_SOFT L-62-A.jpg", False),
    ("7 Soft", "Baby Diaper Pants - (72 Pieces)"):  ("7_SOFT_DAIPER_M", "7_SOFT M-72-A.jpg", False),
    ("7 Soft", "Baby Diaper Pants - (75 Pieces)"):  ("7_SOFT_DAIPER_S", "S 75 A.png", False),
    ("7 Soft", "Baby Diaper Pants - (78 Pieces)"):  ("7_SOFT_DAIPER_S", "7_SOFT S-78-A.jpg", False),

    # --- 24 Care pads
    ("24 Care", "Maxi Cottony Aloevera (L) 6 Pads"):     None,
    ("24 Care", "Ultra Anti Bacterial XL+ 8 Pads"):      ("24_care Anti becteria XL 8 PAD", "24_care Anti becteria XL 8 PAD A.jpg", False),
    ("24 Care", "Ultra Anti Bacterial XXL+ 40 Pads"):    ("24_care Anti becteria XXL 40 PAD", "24_care Anti becteria XXL 40 PAD A.jpg", False),

    # --- 7 Soft pads
    ("7 Soft", "Maxi Care (XL) 6 Pads ( Blue )"):    ("7 Soft Maxi Care XL  6 PAD", "7 Soft Maxi Care XL  6 PAD A.jpg", False),
    ("7 Soft", "Maxi Cottony Care (XXL) 40 Pads"):   ("7 Soft MAXI COTTONY XXL 40 PAD", "7 Soft MAXI COTTONY XXL 40 PAD A.jpg", False),
    ("7 Soft", "Maxi Dry (L) 6 Pads"):               ("7 Soft Maxi Care L  6 PAD", "7 Soft Maxi Care L  6 PAD A.png", False),
    # The 18-pad folder holds files labelled "Extra Sure" for the blue and
    # purple packs. Folder says 7 Soft, files say Extra Sure — flagged.
    ("7 Soft", "Maxi Dry (XL) 18 Pads ( Blue )"):    ("7 Soft Maxi Care XL  18 PAD", "Extra Large - 18 pad - Blue Extra Sure Front.png", True),
    ("7 Soft", "Maxi Dry (XL) 18 Pads ( Orange )"):  ("7 Soft Maxi Care XL  18 PAD", "7 Soft Maxi Care XL  18 PAD A.jpg", False),
    ("7 Soft", "Maxi Dry (XL) 18 Pads (Purple)"):    ("7 Soft Maxi Care XL  18 PAD", "Extra Large - 18 pad - Purple Extra Sure Front.png", True),
    # Orange and Blue 6-pad both point at the same unlabelled file; the folder
    # has one set plus a "purpul" set, so the third colour is unphotographed.
    ("7 Soft", "Maxi Dry (XL) 6 Pads ( Orange )"):   ("7 Soft Maxi Care XL  6 PAD", "7 Soft Maxi Care XL  6 PAD B.jpg", True),
    ("7 Soft", "Maxi Dry (XL) 6 Pads (Purple)"):     ("7 Soft Maxi Care XL  6 PAD", "7 Soft Maxi Care purpul XL  6 PAD A.png", False),
    ("7 Soft", "Ultra Cottony Care (XXL) 40 Pads"):  ("7 Soft Ultra COTTONY XXL 40 PAD", "7 Soft Ultra COTTONY XXL 40 PAD A.jpg", False),
    ("7 Soft", "Ultra Dry (XL) 6 Pads"):             ("7 Soft Ultra Care XL 6 PAD", "7 Soft Ultra Care XL - A.jpg", False),

    # --- Extra Soft. 2XL is the 280mm pack, 3XL the 320mm one; the files in
    #     the XXL folder are named "3X", which matches.
    ("Extra Soft", "Maxi Care-(2XL) 40 Pads (purple)"):  ("EXTRA SOFT XL 40 PAD", "Extra-Sure-XL-40-PAD-2X-Faster-Absorption-001.png", True),
    ("Extra Soft", "Maxi Care-(3XL) 40 Pads (Pink)"):    ("EXTRA SOFT XXL 40 PAD", "Extra-Soft-XXL-40-PAD-3X-Faster-Absorption-001.png", True),
    ("Extra Soft", "Maxi Care-(3XL) 40 Pads (Purple)"):  ("EXTRA SOFT XXL 40 PAD", "Extra-Soft-XXL-40-PAD-3X-Faster-Absorption-002.png", True),
    ("Extra Soft", "Maxi Care-(XXL) 40+10"):             ("EXTRA SOFT XXL 40 + 10 PAD", "Extra_Soft_Jumbo_XXXL_40+10_2023_A.jpg", False),

    # --- Extra Sure
    ("Extra Sure", "Dolphin Pant Style Diaper - (75 Pieces)"): None,
    ("Extra Sure", "Maxi Care-(XXL) 40 Pads"):                 ("EXTRA SURE XXL  40 PAD", "EXTRA SURE XXL 40 PAD A.png", False),
    ("Extra Sure", "Maxi Care-(XXL) 40+10"):                   ("EXTRA SURE XXL  40 +10 Premium", "EXTRA SURE XXL 40 +10 PAD A.png", False),

    # --- No photographs supplied for any of these.
    ("Loose", "Fruit Pant Style Diaper - (75 Pieces)"):    None,
    ("Loose", "Rainbow Pant Style Diaper - (75 Pieces)"):  None,
    ("Sport Girl", "Maxi Care-(XXXL) 40 Pads Black"):      None,
    ("Sport Girl", "Maxi Care-(XXXL) 40 Pads Green"):      None,
    ("Sport Girl", "Maxi Care-(XXXL) 40 Pads Red"):        None,
}

# Sheet brand -> the brand slug already in the database. "Loose" is not a
# brand; those products are sold unbranded and carry no brand at all.
BRAND_SLUG = {
    "7 Soft": "7soft",
    "Extra Sure": "extrasure",
    "Extra Soft": "extrasoft",
    "24 Care": "24care",
    "Sport Girl": None,
    "Loose": None,
}

CATEGORY_SLUG = {"Baby Diapers": "baby-diapers", "Sanitary Pads": "sanitary-pads"}


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return re.sub(r"-{2,}", "-", text)


def read_sheet():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    rows = [[("" if c is None else str(c).strip()) for c in r]
            for r in wb["Sheet1"].iter_rows(values_only=True)]
    rows = [r for r in rows if any(r)][1:]

    products = {}
    for sku, brand, name, variant, category, *_ in rows:
        key = (brand, name)
        products.setdefault(key, {"brand": brand, "name": name, "category": category, "variants": []})
        products[key]["variants"].append({"sku": sku, "size_label": variant})
    return products


def main():
    products = read_sheet()
    keep, skipped, flagged = [], [], []

    for key, p in sorted(products.items()):
        mapping = IMAGE_MAP.get(key, "MISSING")
        if mapping == "MISSING":
            skipped.append((p, "not in the mapping table"))
            continue
        if mapping is None:
            skipped.append((p, "no image supplied"))
            continue

        folder, filename, needs_check = mapping
        path = os.path.join(IMAGES, folder, filename)
        if not os.path.exists(path):
            skipped.append((p, f"file missing: {folder}/{filename}"))
            continue

        p["image_source"] = path
        p["slug"] = slugify(f"{p['brand']} {p['name']}")
        p["brand_slug"] = BRAND_SLUG.get(p["brand"], None)
        p["category_slug"] = CATEGORY_SLUG.get(p["category"])
        keep.append(p)
        if needs_check:
            flagged.append((p, f"{folder}/{filename}"))

    print(f"  IMPORT {len(keep)} products ({sum(len(p['variants']) for p in keep)} variants)")
    print()
    for p in keep:
        brand = p["brand_slug"] or "(unbranded)"
        sizes = ", ".join(v["size_label"] for v in p["variants"])
        print(f"    {brand:<12} {p['name'][:46]:<46} [{sizes}]")
    print()
    print(f"  SKIP {len(skipped)} products")
    for p, why in skipped:
        print(f"    {p['brand']:<12} {p['name'][:46]:<46} — {why}")
    print()
    if flagged:
        print(f"  WORTH CHECKING — folder and filenames disagree on these {len(flagged)}:")
        for p, where in flagged:
            print(f"    {p['brand']} / {p['name']}")
            print(f"        using {where}")

    if "--plan" not in sys.argv:
        with open(os.path.join(ROOT, "import-plan.json"), "w", encoding="utf-8") as f:
            json.dump(keep, f, indent=2)
        print()
        print("  wrote import-plan.json")


if __name__ == "__main__":
    main()
