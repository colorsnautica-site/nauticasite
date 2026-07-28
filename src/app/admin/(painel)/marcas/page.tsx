import { getBrands } from "@/db/queries/brands";
import { CreateBrandForm, DeleteBrandButton } from "@/app/admin/(painel)/_components/BrandActions";

export const dynamic = "force-dynamic";

export default async function AdminMarcas() {
  const brands = await getBrands();
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Marcas parceiras</h1>
      <CreateBrandForm />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} className="mx-auto h-12 object-contain" />
            <p className="mt-2 text-sm font-semibold text-navy">{brand.name}</p>
            <DeleteBrandButton id={brand.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
