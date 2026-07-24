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

async function main() {
  const { db } = await import("@/db/client");
  const { products, siteContent, partnerBrands } = await import("@/db/schema");

  // Guarda de segurança: o banco é a fonte de verdade (todas as edições do
  // painel admin vivem lá). Rodar este seed sem querer apagaria tudo e
  // recolocaria os dados estáticos antigos de src/data/*. Só prossegue se a
  // tabela `products` estiver vazia, ou se o override explícito for passado.
  const force = process.env.SEED_FORCE === "1" || process.argv.includes("--force");
  const existingProduct = await db.select({ id: products.id }).from(products).limit(1);
  if (existingProduct.length > 0 && !force) {
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

  await db.delete(products);
  for (const p of all) {
    await db.insert(products).values({
      sku: p.sku, name: p.name, categorySlug: p.categorySlug, brandName: p.brandName,
      priceCents: p.priceCents, unit: p.unit, stockStatus: p.stockStatus, imageUrl: p.imageUrl, sortOrder: 0
    });
  }

  const content: Record<string, string> = {
    company_name: store.companyName, location: store.location, phone: store.phone,
    whatsapp_1: store.whatsappVisible, whatsapp_2: store.whatsappVisible2,
    instagram: store.instagram, hero_image: store.heroImage,
    hero_title: "Tudo para a sua embarcação em um só lugar",
    hero_description: "Tintas, antifouling, acabamentos e abrasivos de alta performance. Escolha o produto e fale direto com a equipe pelo WhatsApp."
  };
  await db.delete(siteContent);
  for (const [key, value] of Object.entries(content)) await db.insert(siteContent).values({ key, value });

  await db.delete(partnerBrands);
  let order = 0;
  for (const b of brandSeed) await db.insert(partnerBrands).values({ name: b.name, logoUrl: b.logo, sortOrder: order++ });

  console.log(`Semente concluída: ${all.length} produtos, ${brandSeed.length} marcas.`);
  if (all.length !== 1504) console.warn(`ATENÇÃO: esperado 1504 produtos, obtido ${all.length}.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
