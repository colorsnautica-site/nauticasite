import { getBrands } from "@/db/queries/brands";
import { createBrandAction, deleteBrandAction } from "./actions";
import { ImageUploader } from "@/app/admin/(painel)/_components/ImageUploader";

export const dynamic = "force-dynamic";

export default async function AdminMarcas() {
  const brands = await getBrands();
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Marcas parceiras</h1>

      <form action={createBrandAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <ImageUploader name="logo" />
        <label className="text-sm font-semibold text-ink/70">Nome
          <input name="name" required className="mt-1 rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        </label>
        <button className="rounded-full bg-red px-5 py-2 text-sm font-semibold text-white">Adicionar</button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {brands.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.logoUrl} alt={b.name} className="mx-auto h-12 object-contain" />
            <p className="mt-2 text-sm font-semibold text-navy">{b.name}</p>
            <form action={deleteBrandAction}>
              <input type="hidden" name="id" value={b.id} />
              <button className="mt-2 text-xs font-semibold text-red">Remover</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
