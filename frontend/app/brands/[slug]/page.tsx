import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/queries";
import { getSeoGeneral, resolveSiteUrl } from "@/lib/seo";
import StructuredData, { brandSchema, breadcrumbSchema } from "@/components/StructuredData";
import type { Metadata } from "next";
import { isRenderableImage } from "@/lib/image";
import { brandMetaDescription } from "@/lib/meta";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

/**
 * Pre-render every brand at build time, so the first visitor to one is served
 * a finished page instead of waiting on a round trip to Supabase. Anything
 * added afterwards is still rendered on demand and cached from then on.
 *
 * An empty list is a valid answer: if Supabase is unreachable during the
 * build, the pages fall back to on-demand rendering rather than failing it.
 */
export async function generateStaticParams() {
    const brands = await getBrands();
  return brands.filter((brand) => brand.slug).map((brand) => ({ slug: String(brand.slug) }));
}

/** Admin overrides win; otherwise fall back to the brand's own name and tagline. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // getProducts is deduped against the page body's own call by React cache(),
  // so counting the range here costs no extra round trip.
  const [brand, general, products] = await Promise.all([
    getBrandBySlug(slug),
    getSeoGeneral(),
    getProducts({ brandSlug: slug }),
  ]);
  if (!brand) return {};

  const title = brand.meta_title?.trim() || `${brand.name} — sanitary napkins & baby diapers`;
  const description = brandMetaDescription(brand, products.length, general.default_description);

  return {
    title,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: {
      title,
      description,
      url: `/brands/${brand.slug}`,
      images: brand.logo_url ? [{ url: brand.logo_url }] : undefined,
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [brand, products, general] = await Promise.all([
    getBrandBySlug(slug),
    getProducts({ brandSlug: slug }),
    getSeoGeneral(),
  ]);
  if (!brand) return notFound();

  const siteUrl = resolveSiteUrl(general.canonical_domain);

  return (
    <>
      <StructuredData data={brandSchema(brand, products, siteUrl)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: "Products", url: `${siteUrl}/products` },
          { name: brand.name, url: `${siteUrl}/brands/${brand.slug}` },
        ])}
      />
      <Header />
      <main>
        <section className="px-5 md:px-14 py-8 md:py-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {isRenderableImage(brand.logo_url) && (
            <div className="h-12 md:h-16 flex items-center">
              <Image src={brand.logo_url} alt={brand.name} width={400} height={160} className="max-h-12 md:max-h-16 w-auto max-w-[230px] md:max-w-[300px] object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">{brand.name}</h1>
            <p className="text-muted-2 mt-1 max-w-xl">{brand.tagline}</p>
          </div>
        </section>
        {/* The title is what renders the section's <h2>. Without one the page
            went straight from its <h1> to the product cards' <h3>s, which is a
            level skipped — a screen reader announces a subsection with nothing
            above it, and a crawler reads the cards as belonging to nothing. */}
        <ProductShowcase products={products} title={`The ${brand.name} range`} />
      </main>
      <Footer />
    </>
  );
}
