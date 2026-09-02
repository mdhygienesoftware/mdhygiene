import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestListClient from "@/components/RequestListClient";

export const metadata = { title: "Distributor Request List — MDHygiene" };

export default function RequestPage() {
  return (
    <>
      <Header />
      <main className="px-6 md:px-14 py-14 max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">Your request list</h1>
          <p className="text-muted-2 mt-2">
            Review the products you&apos;ve added, then submit as one order request — our team will confirm
            pricing, MOQs and dispatch timelines.
          </p>
        </div>
        <RequestListClient />
      </main>
      <Footer />
    </>
  );
}
