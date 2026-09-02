import BrandForm from "@/components/admin/BrandForm";

export default function NewBrandPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">New brand</h1>
      <BrandForm />
    </div>
  );
}
