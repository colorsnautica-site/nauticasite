// "dotenv/config" só carrega .env por padrão; nosso segredo real vive em
// .env.local (gerado pelo `vercel env pull`), então carregamos explicitamente
// (mesmo padrão usado em drizzle.config.ts).
//
// Atenção: db/client.ts lê DATABASE_URL no escopo do módulo. Imports estáticos
// são "hoisted" pelo esbuild/tsx para antes de qualquer outro código do
// arquivo — inclusive antes desta chamada a config(), mesmo ela aparecendo
// primeiro no código-fonte. Por isso os módulos que dependem de env
// (db/client, db/schema) são importados dinamicamente dentro de main(),
// depois que config() já rodou.
import { config } from "dotenv";
config({ path: ".env.local" });

import { productsBySlug } from "@/data/products/index";
import { store, partnerBrands as brandSeed } from "@/data/store";
import { normalizeBrazilPhone, normalizeInstagram } from "@/lib/phone";

async function main() {
  const { db } = await import("@/db/client");
  const { products, siteContent, partnerBrands, changeLog } = await import("@/db/schema");

  // Guarda de segurança: o banco é a fonte de verdade (todas as edições do
  // painel admin vivem lá). Rodar este seed sem querer apagaria tudo e
  // recolocaria os dados estáticos antigos de src/data/*. Só prossegue se a
  // tabela `products` estiver vazia, ou se o override explícito for passado.
  const force = process.env.SEED_FORCE === "1" || process.argv.includes("--force");
  const [existingProduct, existingContent, existingBrand] = await Promise.all([
    db.select({ id: products.id }).from(products).limit(1),
    db.select({ key: siteContent.key }).from(siteContent).limit(1),
    db.select({ id: partnerBrands.id }).from(partnerBrands).limit(1)
  ]);
  if ((existingProduct.length > 0 || existingContent.length > 0 || existingBrand.length > 0) && !force) {
    console.error(
      "ERRO: a tabela 'products' já contém dados — o seed foi cancelado.\n\n" +
      "Este script APAGA products/siteContent/partnerBrands antes de repopular a partir dos\n" +
      "arquivos estáticos antigos (src/data/products/*.ts, src/data/store.ts). Como o banco é\n" +
      "agora a fonte de verdade (todas as edições feitas pelo painel admin vivem lá), rodar\n" +
      "`npm run db:seed` de novo apagaria silenciosamente todas essas edições e voltaria aos\n" +
      "dados estáticos desatualizados.\n\n" +
      "Se você tem certeza de que quer isso (ex.: resetar um ambiente de dev/teste do zero),\n" +
      "rode de novo com um destes overrides:\n" +
      "  SEED_FORCE=1 npm run db:seed\n" +
      "  npm run db:seed -- --force"
    );
    process.exit(1);
  }

  const all = Object.values(productsBySlug).flat();
  if (all.length !== 1504) throw new Error(`Esperados 1504 produtos; encontrados ${all.length}.`);
  if (brandSeed.length !== 8) throw new Error(`Esperadas 8 marcas; encontradas ${brandSeed.length}.`);

  const productRows = all.map((p) => ({
      sku: p.sku, name: p.name, categorySlug: p.categorySlug, brandName: p.brandName,
      priceCents: p.priceCents, unit: p.unit, stockStatus: p.stockStatus, imageUrl: p.imageUrl, sortOrder: 0
  }));

  const content: Record<string, string> = {
    company_name: store.companyName, location: store.location,
    phone: normalizeBrazilPhone(store.phone)!,
    whatsapp_1: normalizeBrazilPhone(store.whatsappVisible)!,
    whatsapp_2: normalizeBrazilPhone(store.whatsappVisible2)!,
    instagram: normalizeInstagram(store.instagram)!, hero_image: store.heroImage,
    hero_title: "Tudo para a sua embarcação em um só lugar",
    hero_description: "Tintas, antifouling, acabamentos e abrasivos de alta performance. Escolha o produto e fale direto com a equipe pelo WhatsApp."
  };
  const brandRows = brandSeed.map((brand, sortOrder) => ({ name: brand.name, logoUrl: brand.logo, sortOrder }));

  await db.transaction(async (tx) => {
    if (force) await tx.update(changeLog).set({ archivedAt: new Date() });
    await tx.delete(products);
    await tx.delete(siteContent);
    await tx.delete(partnerBrands);

    for (let start = 0; start < productRows.length; start += 250) {
      await tx.insert(products).values(productRows.slice(start, start + 250));
    }
    await tx.insert(siteContent).values(Object.entries(content).map(([key, value]) => ({ key, value })));
    await tx.insert(partnerBrands).values(brandRows);
  });

  console.log(`Semente concluída: ${all.length} produtos, ${brandSeed.length} marcas.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
