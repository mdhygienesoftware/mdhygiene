import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getContactInfo } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "Get a Quote — MDHygiene" };

export default async function ContactPage() {
  const contact = await getContactInfo();

  return (
    <>
      <Header />
      <main className="px-5 md:px-14 py-10 md:py-14 grid md:grid-cols-2 gap-9 md:gap-12 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">Get a quote</h1>
          <p className="text-muted-2">
            Tell us about your distribution, private label, or tender requirement and our team will follow
            up with pricing and MOQs.
          </p>
          <div className="flex flex-col gap-1 text-sm text-muted mt-4">
            <span className="font-bold text-navy">Call</span>
            <span>{contact?.phones?.join(" · ")}</span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted">
            <span className="font-bold text-navy">Email</span>
            <span>{contact?.email}</span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted">
            <span className="font-bold text-navy">Factory</span>
            <span>{contact?.factory_address}</span>
          </div>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
