import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export const metadata = {
  title: "Produtos | Náutica Color",
  description: "Catálogo de tintas náuticas, antifouling, abrasivos, fiberglass, acabamentos e produtos de proteção."
};

export default async function ProductsPage() {
  const { products, brands, categories, settings } = await getCatalog();
  const supportUrl = whatsappUrl(buildSupportMessage(), resolveWhatsappNumber(settings));

  return (
    <main>
      <section className="bg-navy py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold uppercase tracking-[0.2em] text-white/65">Catálogo</p>
          <h1 className="mt-3 font-heading text-5xl font-extrabold">Produtos para manutenção náutica</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Pesquise por produto, marca, SKU ou aplicação. Monte a lista de interesse e confirme preço, estoque e compatibilidade com a equipe pelo WhatsApp.
          </p>
        </div>
      </section>
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16">Carregando produtos...</div>}>
        <CatalogClient products={products} brands={brands} categories={categories} supportUrl={supportUrl} />
      </Suspense>
    </main>
  );
}
