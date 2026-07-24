// ───────────────────────────────────────────────────────────────────────────
// CATALOGO DA LANDING (estatico)
//
// Os produtos vem dos relatorios de estoque do ERP (ver scripts/extract-products.mjs)
// e ficam em src/data/products/<categoria>.ts, um arquivo por categoria. Sem
// preco nem foto reais ainda: priceCents = 0 ("Sob consulta") e imageUrl aponta
// para um placeholder generico ate as fotos oficiais serem cadastradas.
// ───────────────────────────────────────────────────────────────────────────

import { getAllProductsDb, getProductsByCategoryDb } from "@/db/queries/products";

export type StockStatus = "available" | "on_request";

export type Product = {
  id: string;
  sku: string;
  name: string;
  categorySlug: string;
  /** Melhor-esforco a partir da descricao do ERP; vazio quando nao reconhecida. */
  brandName: string;
  /** Preco de referencia em centavos. <= 0 vira "Sob consulta". */
  priceCents: number;
  unit: string;
  stockStatus: StockStatus;
  imageUrl: string;
};

export type Category = {
  slug: string;
  name: string;
};

// Ordem de exibicao das abas: Linha Nautica primeiro (carro-chefe).
export const categories: Category[] = [
  { slug: "linha-nautica", name: "Linha Náutica" },
  { slug: "linha-automotiva", name: "Linha Automotiva" },
  { slug: "adesivos-e-selantes", name: "Adesivos e Selantes" },
  { slug: "polimento", name: "Polimento" },
  { slug: "abrasivos", name: "Abrasivos" },
  { slug: "acessorios", name: "Acessórios" },
  { slug: "ferramentas", name: "Ferramentas" }
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return getProductsByCategoryDb(slug);
}

export async function getAllProducts(): Promise<Product[]> {
  return getAllProductsDb();
}

export type Page<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
};

export function paginate<T>(items: T[], page: number, perPage = 24): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total
  };
}
