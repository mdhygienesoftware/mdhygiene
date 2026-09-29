-- Replaces the catalogue with the supplied spreadsheet.
-- Previous contents backed up to supabase/backups/products-before-import-2026-09-29.json
delete from public.product_variants;
delete from public.products;

insert into public.products
  (slug, name, description, features, badges, image_url, catalog_type, is_active, is_featured, sort_order, brand_id, category_id)
select d.slug, d.name, d.description, '{}', '{}', d.image_url, 'own_brand', true, false, d.sort_order, b.id, c.id
from (values
('24-care-ultra-anti-bacterial-xl-8-pads','24 Care Ultra Anti Bacterial XL+ 8 Pads','Sanitary napkins from 24 Care, 8 Pads per pack, 280mm length.','/images/products/24-care-ultra-anti-bacterial-xl-8-pads.jpg','24care','sanitary-pads',1),
('24-care-ultra-anti-bacterial-xxl-40-pads','24 Care Ultra Anti Bacterial XXL+ 40 Pads','Sanitary napkins from 24 Care, 40 Pads per pack, 320mm length.','/images/products/24-care-ultra-anti-bacterial-xxl-40-pads.jpg','24care','sanitary-pads',2),
('7-soft-baby-diaper-pants-1-pieces','7 Soft Baby Diaper Pants - (1 Pieces)','Pant-style baby diapers from 7 Soft, 1 Pcs per pack, available in Small, Medium and Large.','/images/products/7-soft-baby-diaper-pants-1-pieces.jpg','7soft','baby-diapers',3),
('7-soft-baby-diaper-pants-24-pieces','7 Soft Baby Diaper Pants - (24 Pieces)','Pant-style baby diapers from 7 Soft, 24 Pcs per pack, size Extra Large.','/images/products/7-soft-baby-diaper-pants-24-pieces.jpg','7soft','baby-diapers',4),
('7-soft-baby-diaper-pants-30-pieces','7 Soft Baby Diaper Pants - (30 Pieces)','Pant-style baby diapers from 7 Soft, 30 Pcs per pack, size Large.','/images/products/7-soft-baby-diaper-pants-30-pieces.jpg','7soft','baby-diapers',5),
('7-soft-baby-diaper-pants-34-pieces','7 Soft Baby Diaper Pants - (34 Pieces)','Pant-style baby diapers from 7 Soft, 34 Pcs per pack, size Medium.','/images/products/7-soft-baby-diaper-pants-34-pieces.jpg','7soft','baby-diapers',6),
('7-soft-baby-diaper-pants-40-pieces','7 Soft Baby Diaper Pants - (40 Pieces)','Pant-style baby diapers from 7 Soft, 40 Pcs per pack, size Small.','/images/products/7-soft-baby-diaper-pants-40-pieces.jpg','7soft','baby-diapers',7),
('7-soft-baby-diaper-pants-50-pieces','7 Soft Baby Diaper Pants - (50 Pieces)','Pant-style baby diapers from 7 Soft, 50 Pcs per pack, available in Small, Medium and Large.','/images/products/7-soft-baby-diaper-pants-50-pieces.jpg','7soft','baby-diapers',8),
('7-soft-baby-diaper-pants-56-pieces','7 Soft Baby Diaper Pants - (56 Pieces)','Pant-style baby diapers from 7 Soft, 56 Pcs per pack, size Extra Large.','/images/products/7-soft-baby-diaper-pants-56-pieces.jpg','7soft','baby-diapers',9),
('7-soft-baby-diaper-pants-62-pieces','7 Soft Baby Diaper Pants - (62 Pieces)','Pant-style baby diapers from 7 Soft, 62 Pcs per pack, size Large.','/images/products/7-soft-baby-diaper-pants-62-pieces.jpg','7soft','baby-diapers',10),
('7-soft-baby-diaper-pants-72-pieces','7 Soft Baby Diaper Pants - (72 Pieces)','Pant-style baby diapers from 7 Soft, 72 Pcs per pack, size Medium.','/images/products/7-soft-baby-diaper-pants-72-pieces.jpg','7soft','baby-diapers',11),
('7-soft-baby-diaper-pants-75-pieces','7 Soft Baby Diaper Pants - (75 Pieces)','Pant-style baby diapers from 7 Soft, 75 Pcs per pack, available in Small, Medium and Large.','/images/products/7-soft-baby-diaper-pants-75-pieces.jpg','7soft','baby-diapers',12),
('7-soft-baby-diaper-pants-78-pieces','7 Soft Baby Diaper Pants - (78 Pieces)','Pant-style baby diapers from 7 Soft, 78 Pcs per pack, size Small.','/images/products/7-soft-baby-diaper-pants-78-pieces.jpg','7soft','baby-diapers',13),
('7-soft-maxi-care-xl-6-pads-blue','7 Soft Maxi Care (XL) 6 Pads ( Blue )','Sanitary napkins from 7 Soft, 6 Pads per pack, 280mm length.','/images/products/7-soft-maxi-care-xl-6-pads-blue.jpg','7soft','sanitary-pads',14),
('7-soft-maxi-cottony-care-xxl-40-pads','7 Soft Maxi Cottony Care (XXL) 40 Pads','Sanitary napkins from 7 Soft, 40 Pads per pack, 320mm length.','/images/products/7-soft-maxi-cottony-care-xxl-40-pads.jpg','7soft','sanitary-pads',15),
('7-soft-maxi-dry-l-6-pads','7 Soft Maxi Dry (L) 6 Pads','Sanitary napkins from 7 Soft, 6 Pads per pack, 235mm length.','/images/products/7-soft-maxi-dry-l-6-pads.jpg','7soft','sanitary-pads',16),
('7-soft-maxi-dry-xl-18-pads-blue','7 Soft Maxi Dry (XL) 18 Pads ( Blue )','Sanitary napkins from 7 Soft, 18 Pads per pack, 280mm length.','/images/products/7-soft-maxi-dry-xl-18-pads-blue.jpg','7soft','sanitary-pads',17),
('7-soft-maxi-dry-xl-18-pads-orange','7 Soft Maxi Dry (XL) 18 Pads ( Orange )','Sanitary napkins from 7 Soft, 18 Pads per pack, 280mm length.','/images/products/7-soft-maxi-dry-xl-18-pads-orange.jpg','7soft','sanitary-pads',18),
('7-soft-maxi-dry-xl-18-pads-purple','7 Soft Maxi Dry (XL) 18 Pads (Purple)','Sanitary napkins from 7 Soft, 18 Pads per pack, 280mm length.','/images/products/7-soft-maxi-dry-xl-18-pads-purple.jpg','7soft','sanitary-pads',19),
('7-soft-maxi-dry-xl-6-pads-orange','7 Soft Maxi Dry (XL) 6 Pads ( Orange )','Sanitary napkins from 7 Soft, 6 Pads per pack, 280mm length.','/images/products/7-soft-maxi-dry-xl-6-pads-orange.jpg','7soft','sanitary-pads',20),
('7-soft-maxi-dry-xl-6-pads-purple','7 Soft Maxi Dry (XL) 6 Pads (Purple)','Sanitary napkins from 7 Soft, 6 Pads per pack, 280mm length.','/images/products/7-soft-maxi-dry-xl-6-pads-purple.jpg','7soft','sanitary-pads',21),
('7-soft-ultra-cottony-care-xxl-40-pads','7 Soft Ultra Cottony Care (XXL) 40 Pads','Sanitary napkins from 7 Soft, 40 Pads per pack, 320mm length.','/images/products/7-soft-ultra-cottony-care-xxl-40-pads.jpg','7soft','sanitary-pads',22),
('7-soft-ultra-dry-xl-6-pads','7 Soft Ultra Dry (XL) 6 Pads','Sanitary napkins from 7 Soft, 6 Pads per pack, 280mm length.','/images/products/7-soft-ultra-dry-xl-6-pads.jpg','7soft','sanitary-pads',23),
('extra-soft-maxi-care-2xl-40-pads-purple','Extra Soft Maxi Care-(2XL) 40 Pads (purple)','Sanitary napkins from Extra Soft, 40 Pads per pack, 280mm length.','/images/products/extra-soft-maxi-care-2xl-40-pads-purple.jpg','extrasoft','sanitary-pads',24),
('extra-soft-maxi-care-3xl-40-pads-pink','Extra Soft Maxi Care-(3XL) 40 Pads (Pink)','Sanitary napkins from Extra Soft, 40 Pads per pack, 320mm length.','/images/products/extra-soft-maxi-care-3xl-40-pads-pink.jpg','extrasoft','sanitary-pads',25),
('extra-soft-maxi-care-3xl-40-pads-purple','Extra Soft Maxi Care-(3XL) 40 Pads (Purple)','Sanitary napkins from Extra Soft, 40 Pads per pack, 320mm length.','/images/products/extra-soft-maxi-care-3xl-40-pads-purple.jpg','extrasoft','sanitary-pads',26),
('extra-soft-maxi-care-xxl-40-10','Extra Soft Maxi Care-(XXL) 40+10','Sanitary napkins from Extra Soft, 40+10 Pads per pack, 320mm length.','/images/products/extra-soft-maxi-care-xxl-40-10.jpg','extrasoft','sanitary-pads',27),
('extra-sure-maxi-care-xxl-40-pads','Extra Sure Maxi Care-(XXL) 40 Pads','Sanitary napkins from Extra Sure, 40 Pads per pack, 320mm length.','/images/products/extra-sure-maxi-care-xxl-40-pads.jpg','extrasure','sanitary-pads',28),
('extra-sure-maxi-care-xxl-40-10','Extra Sure Maxi Care-(XXL) 40+10','Sanitary napkins from Extra Sure, 40+10 Pads per pack, 320mm length.','/images/products/extra-sure-maxi-care-xxl-40-10.jpg','extrasure','sanitary-pads',29)
) as d(slug, name, description, image_url, brand_slug, category_slug, sort_order)
left join public.brands b on b.slug = d.brand_slug
left join public.product_categories c on c.slug = d.category_slug;

insert into public.product_variants (product_id, size_label, pack_count, sku, stock_status, sort_order)
select p.id, v.size_label, v.pack_count, v.sku, 'in_stock', v.sort_order
from (values
('24-care-ultra-anti-bacterial-xl-8-pads','280mm','8 Pads','SKU026',1),
('24-care-ultra-anti-bacterial-xxl-40-pads','320mm','40 Pads','SKU027',1),
('7-soft-baby-diaper-pants-1-pieces','Small','1 Pcs','SKU001',1),
('7-soft-baby-diaper-pants-1-pieces','Medium','1 Pcs','SKU002',2),
('7-soft-baby-diaper-pants-1-pieces','Large','1 Pcs','SKU003',3),
('7-soft-baby-diaper-pants-24-pieces','Extra Large','24 Pcs','SKU007',1),
('7-soft-baby-diaper-pants-30-pieces','Large','30 Pcs','SKU006',1),
('7-soft-baby-diaper-pants-34-pieces','Medium','34 Pcs','SKU005',1),
('7-soft-baby-diaper-pants-40-pieces','Small','40 Pcs','SKU004',1),
('7-soft-baby-diaper-pants-50-pieces','Small','50 Pcs','SKU008',1),
('7-soft-baby-diaper-pants-50-pieces','Medium','50 Pcs','SKU009',2),
('7-soft-baby-diaper-pants-50-pieces','Large','50 Pcs','SKU010',3),
('7-soft-baby-diaper-pants-56-pieces','Extra Large','56 Pcs','SKU014',1),
('7-soft-baby-diaper-pants-62-pieces','Large','62 Pcs','SKU013',1),
('7-soft-baby-diaper-pants-72-pieces','Medium','72 Pcs','SKU012',1),
('7-soft-baby-diaper-pants-75-pieces','Small','75 Pcs','SKU047',1),
('7-soft-baby-diaper-pants-75-pieces','Medium','75 Pcs','SKU048',2),
('7-soft-baby-diaper-pants-75-pieces','Large','75 Pcs','SKU049',3),
('7-soft-baby-diaper-pants-78-pieces','Small','78 Pcs','SKU011',1),
('7-soft-maxi-care-xl-6-pads-blue','280mm','6 Pads','SKU030',1),
('7-soft-maxi-cottony-care-xxl-40-pads','320mm','40 Pads','SKU036',1),
('7-soft-maxi-dry-l-6-pads','235mm','6 Pads','SKU028',1),
('7-soft-maxi-dry-xl-18-pads-blue','280mm','18 Pads','SKU035',1),
('7-soft-maxi-dry-xl-18-pads-orange','280mm','18 Pads','SKU033',1),
('7-soft-maxi-dry-xl-18-pads-purple','280mm','18 Pads','SKU034',1),
('7-soft-maxi-dry-xl-6-pads-orange','280mm','6 Pads','SKU029',1),
('7-soft-maxi-dry-xl-6-pads-purple','280mm','6 Pads','SKU031',1),
('7-soft-ultra-cottony-care-xxl-40-pads','320mm','40 Pads','SKU037',1),
('7-soft-ultra-dry-xl-6-pads','280mm','6 Pads','SKU032',1),
('extra-soft-maxi-care-2xl-40-pads-purple','280mm','40 Pads','SKU040',1),
('extra-soft-maxi-care-3xl-40-pads-pink','320mm','40 Pads','SKU042',1),
('extra-soft-maxi-care-3xl-40-pads-purple','320mm','40 Pads','SKU041',1),
('extra-soft-maxi-care-xxl-40-10','320mm','40+10 Pads','SKU043',1),
('extra-sure-maxi-care-xxl-40-pads','320mm','40 Pads','SKU038',1),
('extra-sure-maxi-care-xxl-40-10','320mm','40+10 Pads','SKU039',1)
) as v(product_slug, size_label, pack_count, sku, sort_order)
join public.products p on p.slug = v.product_slug;
