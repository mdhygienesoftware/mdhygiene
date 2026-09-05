import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VariantTable from "@/components/VariantTable";
import { getProductBySlug } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <>
      <Header />
      <main className="px-6 md:px-14 py-14 flex flex-col gap-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="relative rounded-2xl h-[340px] bg-[#F5E1EA] overflow-hidden">
            {product.image_url && (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
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
            <div className="flex gap-3 pt-2">
              <Link href="/contact" className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors">
                Request a quote
              </Link>
              <Link href="/products" className="border border-border px-6 py-3 rounded-lg font-semibold text-navy hover:border-pink transition-colors">
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
