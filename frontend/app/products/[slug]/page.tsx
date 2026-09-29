import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VariantTable from "@/components/VariantTable";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import StructuredData, { breadcrumbSchema, productSchema } from "@/components/StructuredData";
import type { Metadata } from "next";
import { isRenderableImage } from "@/lib/image";
import { productMetaDescription } from "@/lib/meta";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

/**
 * Pre-render every product at build time, so the first visitor to one is served
 * a finished page instead of waiting on a round trip to Supabase. Anything
 * added afterwards is still rendered on demand and cached from then on.
 *
 * An empty list is a valid answer: if Supabase is unreachable during the
 * build, the pages fall back to on-demand rendering rather than failing it.
 */
export async function generateStaticParams() {
    const products = await getProducts();
  return products.filter((product) => product.slug).map((product) => ({ slug: String(product.slug) }));
}

/** Per-product overrides set in admin win; otherwise fall back to product copy. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [product, general] = await Promise.all([getProductBySlug(slug), getSeoGeneral()]);
  if (!product) return {};

  const title = product.meta_title?.trim() || product.name;
  const description = productMetaDescription(product, general.default_description);
  const image = product.og_image_url?.trim() || product.image_url || general.default_og_image;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetched together rather than in series; both are already deduped against
  // generateMetadata's calls by React cache().
  const [product, general] = await Promise.all([getProductBySlug(slug), getSeoGeneral()]);
  if (!product) return notFound();

  const siteUrl = resolveSiteUrl(general.canonical_domain);

  return (
    <>
      <StructuredData data={productSchema(product, product.brand?.name ?? null, siteUrl)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", url: `${siteUrl}/` },
          { name: "Products", url: `${siteUrl}/products` },
          { name: product.name, url: `${siteUrl}/products/${product.slug}` },
        ])}
      />
      <Header />
      <main className="px-5 md:px-14 py-8 md:py-12 flex flex-col gap-10 md:gap-12">
        <div className="grid md:grid-cols-2 gap-7 md:gap-10">
          <div className="relative rounded-2xl h-[240px] sm:h-[300px] md:h-[340px] bg-white border border-border overflow-hidden">
            {isRenderableImage(product.image_url) && (
              <Image src={product.image_url} alt={product.name} fill className="object-contain p-6" sizes="(max-width: 768px) 100vw, 50vw" />
            )}
          </div>
          <div className="flex flex-col gap-5">
            {product.brand && (
              <Link
                href={`/brands/${product.brand.slug}`}
                className="text-[13px] font-bold tracking-[0.14em] uppercase w-fit"
                style={{ color: product.brand.accent_color ?? "#E4779F" }}
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-tight">{product.name}</h1>
            {product.description && <p className="text-muted-2 leading-relaxed">{product.description}</p>}
            {!!product.features?.length && (
              <ul className="flex flex-col gap-2 text-[15px] text-navy font-semibold">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-blue">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/contact" className="text-center bg-navy text-white px-6 py-3.5 sm:py-3 rounded-lg font-semibold hover:bg-pink transition-colors">
                Request a quote
              </Link>
              <Link href="/products" className="text-center border border-border px-6 py-3.5 sm:py-3 rounded-lg font-semibold text-navy hover:border-pink transition-colors">
                Back to catalog
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold text-navy">Sizes &amp; packs</h2>
          <VariantTable product={product} />
          <p className="text-xs text-muted">
            Distributor pricing and MOQs are quoted on enquiry — <Link href="/contact" className="text-blue font-semibold">request a quote</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
