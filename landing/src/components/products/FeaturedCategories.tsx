"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Product } from "@/data/catalog";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductGrid } from "@/components/products/ProductGrid";

export type FeaturedGroup = {
  category: Category;
  products: Product[];
};

/**
 * Seção "Produtos em destaque": abas de categoria + prévia (poucos produtos)
 * da categoria ativa + link "Ver todos" para o catálogo completo daquela
 * categoria. Recebe do server só uma prévia por categoria (não o catálogo
 * inteiro) para manter o payload do client leve.
 */
export function FeaturedCategories({ groups }: { groups: FeaturedGroup[] }) {
  const [activeSlug, setActiveSlug] = useState(groups[0]?.category.slug ?? "");
  const active = groups.find((group) => group.category.slug === activeSlug) ?? groups[0];

  if (!active) return null;

  return (
    <div className="mt-10">
      <CategoryTabs
        mode="state"
        categories={groups.map((group) => group.category)}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
      />

      <div className="mt-8">
        <ProductGrid products={active.products} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={`/produtos/${active.category.slug}`}
          className="inline-flex items-center gap-2 font-semibold text-navy transition hover:text-red"
        >
          Ver todos em {active.category.name} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
