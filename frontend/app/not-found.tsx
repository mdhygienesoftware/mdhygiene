import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page not found",
  // A 404 has nothing worth ranking, and letting one into the index means a
  // search result that leads nowhere.
  robots: { index: false, follow: true },
};

/**
 * Shown for any address that does not exist.
 *
 * Next's default is a bare line of text on a white page — no header, no
 * footer, no way onward. Someone arriving on a link that has moved is left
 * with the back button, which on a link opened from an email or a search
 * result goes nowhere.
 *
 * Product addresses change when the catalogue is reimported, so this is not a
 * rare page: every old product URL leads here. It offers the routes a person
 * who wanted a product would actually want next.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="px-5 md:px-14 py-16 md:py-24 flex flex-col items-start gap-6 max-w-2xl">
        <span className="text-[13px] font-bold tracking-[0.14em] text-pink">404</span>
        <h1 className="text-3xl md:text-[40px] font-extrabold text-navy leading-[1.18]">
          That page isn&apos;t here
        </h1>
        <p className="text-[15px] md:text-base leading-relaxed text-muted-2">
          The address may have changed, or the product may no longer be listed. The catalogue
          below has everything we currently make — and if you were looking for something
          specific, tell us and we will point you to it.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/products"
            className="bg-navy text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-pink transition-colors"
          >
            Browse the catalogue
          </Link>
          <Link
            href="/contact"
            className="border border-border bg-white text-navy px-7 py-3.5 rounded-lg font-semibold hover:border-pink transition-colors"
          >
            Ask us
          </Link>
        </div>

        <nav className="pt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            ["/", "Home"],
            ["/about", "About"],
            ["/certifications", "Certifications"],
            ["/careers", "Careers"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="text-blue font-semibold hover:text-pink transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
    </>
  );
}
