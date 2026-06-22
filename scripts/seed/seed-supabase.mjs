// Popula o Supabase com o catálogo (catalog-seed.json) via service role key.
//
// O schema (supabase/migrations/001_nautica_catalog.sql) usa PK uuid auto-gerada,
// então o seed usa chaves naturais (site.slug, brand.slug, category.slug,
// product.sku) e este script resolve os uuids via upsert + select.
//
// Uso (PowerShell):
//   $env:SUPABASE_URL="https://xxxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
//   node scripts/seed/seed-supabase.mjs
//
// Pré-requisito: aplicar o schema (supabase/migrations/001_nautica_catalog.sql).
// A service role key IGNORA o RLS — use só localmente, nunca exponha no front.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(here, "catalog-seed.json"), "utf8"));
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function die(label, error) {
  console.error(`Erro em ${label}:`, error.message ?? error);
  process.exit(1);
}

async function upsertChunked(table, rows, onConflict) {
  const size = 500;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) die(`${table} [${i}-${i + chunk.length}]`, error);
    console.log(`  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

async function main() {
  console.log("Seed Supabase iniciado…");

  // 1) Site
  const { error: siteErr } = await supabase.from("store_sites").upsert(seed.site, { onConflict: "slug" });
  if (siteErr) die("store_sites", siteErr);
  const { data: siteRow, error: siteSelErr } = await supabase
    .from("store_sites")
    .select("id")
    .eq("slug", seed.site.slug)
    .single();
  if (siteSelErr) die("store_sites select", siteSelErr);
  const siteId = siteRow.id;
  console.log(`  site_id = ${siteId}`);

  // 2) Marcas e categorias (upsert por (site_id, slug))
  await upsertChunked("store_brands", seed.brands.map((b) => ({ ...b, site_id: siteId })), "site_id,slug");
  await upsertChunked("store_categories", seed.categories.map((c) => ({ ...c, site_id: siteId })), "site_id,slug");

  // 3) Resolver uuids de marca/categoria por slug
  const { data: brandRows, error: bErr } = await supabase.from("store_brands").select("id,slug").eq("site_id", siteId);
  if (bErr) die("store_brands select", bErr);
  const { data: catRows, error: cErr } = await supabase.from("store_categories").select("id,slug").eq("site_id", siteId);
  if (cErr) die("store_categories select", cErr);
  const brandId = new Map(brandRows.map((r) => [r.slug, r.id]));
  const categoryId = new Map(catRows.map((r) => [r.slug, r.id]));

  // 4) Produtos (upsert por (site_id, sku)). brand_slug pode ser null => sem marca.
  const productRows = seed.products.map(({ brand_slug, category_slug, ...rest }) => ({
    ...rest,
    site_id: siteId,
    brand_id: brand_slug ? brandId.get(brand_slug) ?? null : null,
    category_id: categoryId.get(category_slug)
  }));
  const missingCat = productRows.filter((r) => !r.category_id);
  if (missingCat.length) die("produtos", new Error(`${missingCat.length} produto(s) sem categoria resolvida`));
  await upsertChunked("store_products", productRows, "site_id,sku");

  // 4b) Remove produtos do site que não estão no seed (ex.: os de exemplo da migration).
  const seedSkus = new Set(seed.products.map((p) => p.sku));
  const { data: existing, error: exErr } = await supabase.from("store_products").select("id,sku").eq("site_id", siteId);
  if (exErr) die("store_products select", exErr);
  const staleIds = existing.filter((r) => !seedSkus.has(r.sku)).map((r) => r.id);
  if (staleIds.length) {
    for (let i = 0; i < staleIds.length; i += 500) {
      const { error } = await supabase.from("store_products").delete().in("id", staleIds.slice(i, i + 500));
      if (error) die("store_products delete", error);
    }
    console.log(`  removidos ${staleIds.length} produto(s) fora do seed`);
  }

  // 5) Configurações (upsert por (site_id, key))
  await upsertChunked("store_settings", seed.settings.map((s) => ({ ...s, site_id: siteId })), "site_id,key");

  console.log("Seed concluído ✓");
  console.log(`brands=${seed.brands.length} categories=${seed.categories.length} products=${seed.products.length} settings=${seed.settings.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
