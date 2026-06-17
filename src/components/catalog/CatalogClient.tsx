"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Brand, Category, Product } from "@/types/catalog";

type Sort = "featured" | "price-asc" | "price-desc" | "alpha";

export function CatalogClient({ products, brands, categories }: { products: Product[]; brands: Brand[]; categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState(searchParams.get("marca") ?? "");
  const [category, setCategory] = useState(searchParams.get("categoria") ?? "");
  const [sort, setSort] = useState<Sort>((searchParams.get("ordem") as Sort) || "featured");

  function updateUrl(next: { q?: string; marca?: string; categoria?: string; ordem?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => router.replace(`/produtos?${params.toString()}`, { scroll: false }));
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products
      .filter((product) => {
        const matchesQuery = normalized
          ? `${product.name} ${product.sku} ${product.shortDescription}`.toLowerCase().includes(normalized)
          : true;
        return matchesQuery && (!brand || product.brand?.slug === brand) && (!category || product.category?.slug === category);
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.priceCents - b.priceCents;
        if (sort === "price-desc") return b.priceCents - a.priceCents;
        if (sort === "alpha") return a.name.localeCompare(b.name, "pt-BR");
        return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "pt-BR");
      });
  }, [brand, category, products, query, sort]);

  function clearFilters() {
    setQuery("");
    setBrand("");
    setCategory("");
    setSort("featured");
    startTransition(() => router.replace("/produtos", { scroll: false }));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-4 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar produto</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/45" size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                updateUrl({ q: event.target.value });
              }}
              placeholder="Buscar por nome, SKU ou aplicação"
              className="h-12 w-full rounded-full border border-navy/15 pl-11 pr-4 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por marca</span>
            <select
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                updateUrl({ marca: event.target.value });
              }}
              className="h-12 w-full rounded-full border border-navy/15 px-4 text-sm"
            >
              <option value="">Todas as marcas</option>
              {brands.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por categoria</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                updateUrl({ categoria: event.target.value });
              }}
              className="h-12 w-full rounded-full border border-navy/15 px-4 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Ordenar produtos</span>
            <select
              value={sort}
              onChange={(event) => {
                const value = event.target.value as Sort;
                setSort(value);
                updateUrl({ ordem: value });
              }}
              className="h-12 w-full rounded-full border border-navy/15 px-4 text-sm"
            >
              <option value="featured">Destaques primeiro</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="alpha">Ordem alfabética</option>
            </select>
          </label>
          <button type="button" onClick={clearFilters} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-off-white px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
            <X size={16} aria-hidden="true" /> Limpar
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="font-semibold text-navy">{filtered.length} produto(s) encontrado(s)</p>
        {isPending ? <p className="text-sm text-ink/60">Atualizando filtros...</p> : <SlidersHorizontal className="text-red" size={22} aria-hidden="true" />}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 180} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg bg-white p-12 text-center shadow-soft">
          <h2 className="font-heading text-2xl font-bold text-navy">Nenhum produto encontrado.</h2>
          <p className="mt-2 text-ink/70">Tente ajustar os filtros ou fale com a equipe para uma indicação personalizada.</p>
        </div>
      )}
    </section>
  );
}
