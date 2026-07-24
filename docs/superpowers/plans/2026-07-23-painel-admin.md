# Painel de Admin da Náutica Color — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao dono um painel em `/admin` que edita, em tempo real e sem tocar em código, o nome/foto/preço/disponibilidade/marca/categoria de cada produto, mais o hero, o contato e as marcas parceiras — com histórico e desfazer.

**Architecture:** O app Next.js atual passa a ler os produtos de um **Postgres** (Vercel/Neon, via Drizzle ORM), com fotos no **Vercel Blob**. O painel é uma área protegida por **senha única** (sessão em cookie assinado com `jose`), que grava via **Server Actions** e dispara `revalidateTag` para o site público refletir na hora. Toda escrita registra um snapshot em `change_log` para permitir desfazer.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.7 · Tailwind 3.4 · Drizzle ORM + `postgres` (postgres-js) · `@vercel/blob` · `jose` (JWT) · Vitest (testes de lógica pura).

## Global Constraints

- **Node/Next:** Next.js `^15.1.6`, React `^19`, TypeScript `^5.7`. Não fazer downgrade.
- **Imagens:** site público usa `<img>` (não `next/image`) — manter (ver `next.config.ts`).
- **Idioma/estilo:** UI e textos em **português**; comentários em português como no resto do repo.
- **Paleta/tokens Tailwind:** navy, red, sky, mist, ink; headings `font-heading` (Space Grotesk); botões/abas `rounded-full`. Respeitar `docs/VISUAL_GUARDRAILS.md`.
- **Preço:** armazenado em `priceCents` (int). `> 0` → "R$ X,XX"; `<= 0` → "Sob consulta".
- **Segredos:** `ADMIN_PASSWORD`, `SESSION_SECRET`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` **só** em variáveis de ambiente — nunca no código nem commitados.
- **Segurança:** toda rota `/admin/*` (exceto `/admin/login`) e toda Server Action de escrita exige sessão válida.
- **Tipo de produto (app):** `Product = { id: string; sku: string; name: string; categorySlug: string; brandName: string; priceCents: number; unit: string; stockStatus: "available" | "on_request"; imageUrl: string }` — manter esta forma na fronteira pública.
- **Categorias:** fixas em `src/data/catalog.ts` (`categories`, `getCategoryBySlug`, `paginate`) — **não** vão para o banco.

---

## Refinações sobre a spec (registradas)

1. **Sem tabela `categories`.** As 7 categorias continuam estáticas no código (não editáveis). `products.category_slug` é texto validado contra essa lista.
2. **`products.id` gerado pelo banco** (identity). O código do ERP fica em `products.sku`. A camada de dados expõe `id` como string (`String(row.id)`) para manter o `Product` atual.

---

## Estrutura de arquivos

Criar:
- `src/db/schema.ts` — tabelas Drizzle (`products`, `site_content`, `partner_brands`, `change_log`).
- `src/db/client.ts` — instância `db` (postgres-js + Drizzle).
- `src/db/mappers.ts` — `rowToProduct(row): Product`.
- `src/db/queries/products.ts` — leituras de produtos (com cache/tags).
- `src/db/queries/content.ts` — leituras de hero/contato.
- `src/db/queries/brands.ts` — leituras de marcas.
- `src/db/queries/changelog.ts` — leituras do histórico.
- `src/db/changelog.ts` — `recordChange(...)` + `computeUndo(entry)`.
- `src/lib/auth.ts` — sessão (assinar/verificar) + checagem de senha.
- `src/lib/blob.ts` — upload de imagem validado.
- `src/lib/money.ts` — `parseReaisToCents`, `centsToReaisInput` (reusa `@/lib/currency`).
- `src/middleware.ts` — protege `/admin/*`.
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx` (início).
- `src/app/admin/login/page.tsx`, `src/app/admin/login/layout.tsx`, `src/app/admin/actions/auth.ts`.
- `src/app/admin/produtos/page.tsx` + `src/app/admin/produtos/actions.ts`.
- `src/app/admin/conteudo/page.tsx` + `src/app/admin/conteudo/actions.ts`.
- `src/app/admin/marcas/page.tsx` + `src/app/admin/marcas/actions.ts`.
- `src/app/admin/historico/page.tsx` + `src/app/admin/historico/actions.ts`.
- `src/app/admin/_components/*` — `ImageUploader.tsx`, `ProductRow.tsx`, `AdminNav.tsx`.
- `scripts/seed.ts` — migração inicial (semente).
- `drizzle.config.ts` — config do Drizzle Kit.
- `vitest.config.ts` + `src/**/*.test.ts` — testes de lógica pura.

Modificar:
- `src/data/catalog.ts` — `getProductsByCategory`/`getAllProducts` passam a ser async, lendo do banco.
- `src/app/page.tsx`, `src/app/produtos/page.tsx`, `src/app/produtos/[categoria]/page.tsx` — `await` nas leituras.
- `src/app/page.tsx`, `src/components/BrandsMarquee.tsx` (Fase 4) — hero/contato/marcas do banco.
- `package.json` — novas deps + scripts (`db:generate`, `db:migrate`, `db:seed`, `test`).

---

# FASE 0 — Fundação (banco, Blob, schema, migração inicial)

### Task 0.1: Provisionar Postgres + Blob na Vercel (AÇÃO DO DONO)

> **Esta task é executada pelo dono no painel da Vercel.** O agente não tem acesso à conta. Fornecer instruções e aguardar as variáveis.

**Files:** nenhum (configuração externa).

- [ ] **Passo 1: Criar o banco Postgres**
  Dashboard da Vercel → projeto `nauticasite` → aba **Storage** → **Create Database** → **Postgres (Neon)** no Marketplace → região mais próxima → **Create & Connect** ao projeto. Injeta `DATABASE_URL` (usar a **pooled connection string**).

- [ ] **Passo 2: Ligar o Vercel Blob**
  Storage → **Create** → **Blob** → conectar ao projeto. Injeta `BLOB_READ_WRITE_TOKEN`.

- [ ] **Passo 3: Definir os segredos do painel**
  Settings → **Environment Variables** (Production + Preview + Development):
  - `ADMIN_PASSWORD` = (senha escolhida pelo dono)
  - `SESSION_SECRET` = string aleatória longa (`openssl rand -base64 48`)

- [ ] **Passo 4: Baixar as env para desenvolvimento local**
  `npm i -g vercel` (se preciso) → `vercel link` → `vercel env pull .env.local`. Conferir que `.env*.local` está no `.gitignore`.

**Verificação:** `.env.local` contém `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

---

### Task 0.2: Instalar dependências e configurar ferramentas

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `drizzle.config.ts`, `vitest.config.ts`

**Interfaces:**
- Produces: scripts npm `db:generate`, `db:migrate`, `db:seed`, `test`; Drizzle Kit, Vitest, tsx disponíveis.

- [ ] **Passo 1: Instalar deps de runtime**

```bash
npm install drizzle-orm postgres @vercel/blob jose
```

- [ ] **Passo 2: Instalar deps de desenvolvimento**

```bash
npm install -D drizzle-kit tsx vitest dotenv
```

- [ ] **Passo 3: Adicionar scripts ao `package.json`** (no bloco `"scripts"`)

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx scripts/seed.ts",
"test": "vitest run"
```

- [ ] **Passo 4: Criar `drizzle.config.ts`**

```ts
import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! }
} satisfies Config;
```

- [ ] **Passo 5: Criar `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } }
});
```

- [ ] **Passo 6: Garantir `.env*.local` ignorado**

Conferir `.gitignore` tem `.env*.local`. Se não, adicionar a linha.

- [ ] **Passo 7: Verificar**

Run: `npm run typecheck` → sem erros. `npx drizzle-kit --help` roda sem erro.

- [ ] **Passo 8: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts vitest.config.ts .gitignore
git commit -m "chore(admin): deps e config (drizzle, blob, jose, vitest)"
```

---

### Task 0.3: Schema do banco + cliente

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`

**Interfaces:**
- Produces: `products`, `siteContent`, `partnerBrands`, `changeLog` (tabelas); `db` (cliente); tipos `ProductRow`, `PartnerBrandRow`, `ChangeLogRow`.

- [ ] **Passo 1: Criar `src/db/schema.ts`**

```ts
import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().default(""),
  name: text("name").notNull(),
  categorySlug: text("category_slug").notNull(),
  brandName: text("brand_name").notNull().default(""),
  priceCents: integer("price_cents").notNull().default(0),
  unit: text("unit").notNull().default("UN"),
  stockStatus: text("stock_status").notNull().default("available"),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Configuração chave→valor do site (hero + contato).
export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default("")
});

export const partnerBrands = pgTable("partner_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0)
});

// Histórico para desfazer: guarda o registro antes e depois de cada escrita.
export const changeLog = pgTable("change_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "product" | "site_content" | "partner_brand"
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),          // "create" | "update" | "delete"
  snapshotBefore: jsonb("snapshot_before"),
  snapshotAfter: jsonb("snapshot_after"),
  changedAt: timestamp("changed_at").notNull().defaultNow()
});

export type ProductRow = typeof products.$inferSelect;
export type PartnerBrandRow = typeof partnerBrands.$inferSelect;
export type ChangeLogRow = typeof changeLog.$inferSelect;
```

- [ ] **Passo 2: Criar `src/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não definida");

// Uma conexão por processo; a URL pooled da Neon cuida do pool no serverless.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

- [ ] **Passo 3: Verificar** — Run: `npm run typecheck` → sem erros.

- [ ] **Passo 4: Commit**

```bash
git add src/db/schema.ts src/db/client.ts
git commit -m "feat(admin): schema do banco e cliente drizzle"
```

---

### Task 0.4: Gerar e aplicar a migração

**Files:** Create: `drizzle/**` (gerado)

- [ ] **Passo 1: Gerar SQL** — Run: `npm run db:generate` → cria `drizzle/0000_*.sql` com as 4 tabelas.
- [ ] **Passo 2: Aplicar** — Run: `npm run db:migrate` → "migrations applied". (Requer `DATABASE_URL` em `.env.local`.)
- [ ] **Passo 3: Conferir** — Run: `npx drizzle-kit studio` (ou `psql "$DATABASE_URL" -c "\dt"`) → aparecem `products`, `site_content`, `partner_brands`, `change_log`.
- [ ] **Passo 4: Commit**

```bash
git add drizzle
git commit -m "feat(admin): migracao inicial do banco"
```

---

### Task 0.5: Script de semente (migra os 1.504 produtos + conteúdo + marcas)

**Files:** Create: `scripts/seed.ts`

**Interfaces:**
- Consumes: `productsBySlug` (de `@/data/products/index`), `store`, `partnerBrands` (de `@/data/store`).
- Produces: banco populado; imprime a contagem final.

- [ ] **Passo 1: Criar `scripts/seed.ts`**

```ts
import "dotenv/config";
import { db } from "@/db/client";
import { products, siteContent, partnerBrands } from "@/db/schema";
import { productsBySlug } from "@/data/products/index";
import { store, partnerBrands as brandSeed } from "@/data/store";

async function main() {
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
```

- [ ] **Passo 2: Rodar** — Run: `npm run db:seed` → `Semente concluída: 1504 produtos, 8 marcas.` sem o aviso.
- [ ] **Passo 3: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat(admin): script de semente do banco (1504 produtos + conteudo + marcas)"
```

---

# FASE 1 — Site público lê os produtos do banco

### Task 1.1: Mapper `rowToProduct` (lógica pura, TDD)

**Files:** Create: `src/db/mappers.ts`, `src/db/mappers.test.ts`

**Interfaces:** Produces: `rowToProduct(row: ProductRow): Product`.

- [ ] **Passo 1: Teste que falha — `src/db/mappers.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { rowToProduct } from "./mappers";
import type { ProductRow } from "./schema";

const row: ProductRow = {
  id: 42, sku: "00865", name: "3M Adesivo", categorySlug: "adesivos-e-selantes",
  brandName: "3M", priceCents: 0, unit: "UN", stockStatus: "available",
  imageUrl: "/x.png", sortOrder: 0, createdAt: new Date(), updatedAt: new Date()
};

describe("rowToProduct", () => {
  it("converte id numérico para string e preserva campos", () => {
    const p = rowToProduct(row);
    expect(p.id).toBe("42");
    expect(p.sku).toBe("00865");
    expect(p.stockStatus).toBe("available");
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar** — Run: `npm test -- src/db/mappers.test.ts` → FAIL ("rowToProduct is not defined").

- [ ] **Passo 3: Implementar `src/db/mappers.ts`**

```ts
import type { Product } from "@/data/catalog";
import type { ProductRow } from "./schema";

export function rowToProduct(row: ProductRow): Product {
  return {
    id: String(row.id), sku: row.sku, name: row.name, categorySlug: row.categorySlug,
    brandName: row.brandName, priceCents: row.priceCents, unit: row.unit,
    stockStatus: row.stockStatus === "on_request" ? "on_request" : "available",
    imageUrl: row.imageUrl
  };
}
```

- [ ] **Passo 4: Rodar e ver passar** — Run: `npm test -- src/db/mappers.test.ts` → PASS.
- [ ] **Passo 5: Commit**

```bash
git add src/db/mappers.ts src/db/mappers.test.ts
git commit -m "feat(admin): mapper rowToProduct com teste"
```

---

### Task 1.2: Camada de leitura de produtos (com cache/tags)

**Files:** Create: `src/db/queries/products.ts`

**Interfaces:** Produces: `getAllProductsDb()`, `getProductsByCategoryDb(slug)`, `PRODUCTS_TAG = "products"`.

- [ ] **Passo 1: Criar `src/db/queries/products.ts`**

```ts
import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { rowToProduct } from "@/db/mappers";
import type { Product } from "@/data/catalog";

export const PRODUCTS_TAG = "products";

export const getAllProductsDb = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
    return rows.map(rowToProduct);
  },
  ["all-products"], { tags: [PRODUCTS_TAG] }
);

export const getProductsByCategoryDb = unstable_cache(
  async (slug: string): Promise<Product[]> => {
    const rows = await db.select().from(products).where(eq(products.categorySlug, slug))
      .orderBy(asc(products.sortOrder), asc(products.id));
    return rows.map(rowToProduct);
  },
  ["products-by-category"], { tags: [PRODUCTS_TAG] }
);
```

- [ ] **Passo 2: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 3: Commit**

```bash
git add src/db/queries/products.ts
git commit -m "feat(admin): leitura de produtos do banco com cache por tag"
```

---

### Task 1.3: Trocar `catalog.ts` para ler do banco (async)

**Files:** Modify: `src/data/catalog.ts`

**Interfaces:** Produces (assinaturas alteradas): `getProductsByCategory(slug): Promise<Product[]>`, `getAllProducts(): Promise<Product[]>`. Mantidas: `categories`, `getCategoryBySlug`, `paginate`, tipos.

- [ ] **Passo 1: Editar `src/data/catalog.ts`** — remover `import { productsBySlug }` e as versões síncronas; substituir por:

```ts
import { getAllProductsDb, getProductsByCategoryDb } from "@/db/queries/products";

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return getProductsByCategoryDb(slug);
}
export async function getAllProducts(): Promise<Product[]> {
  return getAllProductsDb();
}
```

Manter `categories`, `getCategoryBySlug`, `paginate`, `Product`, `Category`, `Page`, `StockStatus`.

- [ ] **Passo 2: Verificar tipos** — Run: `npm run typecheck` → erros esperados nos consumidores (corrigidos na Task 1.4).
- [ ] **Passo 3: Commit**

```bash
git add src/data/catalog.ts
git commit -m "feat(admin): catalog.ts le produtos do banco (async)"
```

---

### Task 1.4: `await` nas páginas públicas

**Files:** Modify: `src/app/page.tsx`, `src/app/produtos/page.tsx`, `src/app/produtos/[categoria]/page.tsx`

- [ ] **Passo 1: `src/app/page.tsx`** — trocar a montagem síncrona de `featuredGroups` por:

```ts
const featuredGroups: FeaturedGroup[] = await Promise.all(
  categories.map(async (category) => ({
    category,
    products: (await getProductsByCategory(category.slug)).slice(0, 4)
  }))
);
```

Garantir `export default async function LandingPage()`.

- [ ] **Passo 2: `src/app/produtos/page.tsx`** — `const all = await getAllProducts()`. Confirmar `async`.
- [ ] **Passo 3: `src/app/produtos/[categoria]/page.tsx`** — `await getProductsByCategory(slug)`. Confirmar `async`. `generateStaticParams` continua usando `categories` (estático).
- [ ] **Passo 4: Verificar build** — Run: `npm run typecheck && npm run build` → passa (requer `DATABASE_URL` no build; a Vercel injeta, local usa `.env.local`).
- [ ] **Passo 5: Manual** — `npm run dev` → `http://127.0.0.1:3001` e `/produtos`: produtos aparecem, paginação coerente.
- [ ] **Passo 6: Commit**

```bash
git add src/app/page.tsx src/app/produtos/page.tsx "src/app/produtos/[categoria]/page.tsx"
git commit -m "feat(admin): paginas publicas leem produtos do banco"
```

---

# FASE 2 — Login e esqueleto do painel

### Task 2.1: Lib de dinheiro (reais ↔ centavos) (TDD)

**Files:** Create: `src/lib/money.ts`, `src/lib/money.test.ts`

**Interfaces:** Produces: `parseReaisToCents(input): number | null`, `centsToReaisInput(cents): string`.

- [ ] **Passo 1: Teste que falha — `src/lib/money.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseReaisToCents, centsToReaisInput } from "./money";

describe("parseReaisToCents", () => {
  it("aceita virgula, ponto e prefixo R$", () => {
    expect(parseReaisToCents("12,50")).toBe(1250);
    expect(parseReaisToCents("12.50")).toBe(1250);
    expect(parseReaisToCents("R$ 12,50")).toBe(1250);
    expect(parseReaisToCents("100")).toBe(10000);
  });
  it("vazio vira 0 (Sob consulta)", () => { expect(parseReaisToCents("")).toBe(0); });
  it("invalido vira null", () => { expect(parseReaisToCents("abc")).toBeNull(); });
});

describe("centsToReaisInput", () => {
  it("formata para input", () => {
    expect(centsToReaisInput(1250)).toBe("12,50");
    expect(centsToReaisInput(0)).toBe("");
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar** — Run: `npm test -- src/lib/money.test.ts` → FAIL.

- [ ] **Passo 3: Implementar `src/lib/money.ts`**

```ts
// Converte texto digitado (reais) para centavos. "" → 0. Inválido → null.
export function parseReaisToCents(input: string): number | null {
  const cleaned = input.replace(/r\$\s*/i, "").trim();
  if (cleaned === "") return 0;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

// Centavos → texto para preencher o input. 0 → "" (Sob consulta).
export function centsToReaisInput(cents: number): string {
  if (!cents || cents <= 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
```

- [ ] **Passo 4: Rodar e ver passar** — Run: `npm test -- src/lib/money.test.ts` → PASS.
- [ ] **Passo 5: Commit**

```bash
git add src/lib/money.ts src/lib/money.test.ts
git commit -m "feat(admin): conversao reais<->centavos com testes"
```

---

### Task 2.2: Lib de autenticação (sessão + senha) (TDD)

**Files:** Create: `src/lib/auth.ts`, `src/lib/auth.test.ts`

**Interfaces:** Produces: `SESSION_COOKIE = "nautica_admin"`, `SESSION_MAX_AGE`, `createSessionToken()`, `verifySessionToken(token)`, `checkPassword(input)`.

- [ ] **Passo 1: Teste que falha — `src/lib/auth.test.ts`**

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken, checkPassword } from "./auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "teste-secreto-bem-longo-para-o-jose-assinar-ok";
  process.env.ADMIN_PASSWORD = "senha123";
});

describe("sessão", () => {
  it("token válido verifica true; lixo verifica false", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
    expect(await verifySessionToken("lixo")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });
});

describe("senha", () => {
  it("compara com a env", () => {
    expect(checkPassword("senha123")).toBe(true);
    expect(checkPassword("errada")).toBe(false);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar** — Run: `npm test -- src/lib/auth.test.ts` → FAIL.

- [ ] **Passo 3: Implementar `src/lib/auth.ts`**

```ts
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "nautica_admin";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não definida");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG }).setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`).sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch { return false; }
}

// Comparação em tempo (quase) constante para não vazar o tamanho da senha.
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (expected.length === 0) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
```

- [ ] **Passo 4: Rodar e ver passar** — Run: `npm test -- src/lib/auth.test.ts` → PASS.
- [ ] **Passo 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts
git commit -m "feat(admin): lib de autenticacao (sessao jose + senha)"
```

---

### Task 2.3: Middleware protegendo `/admin/*`

**Files:** Create: `src/middleware.ts`

**Interfaces:** Consumes: `verifySessionToken`, `SESSION_COOKIE`.

- [ ] **Passo 1: Criar `src/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Passo 2: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(admin): middleware protege rotas /admin"
```

---

### Task 2.4: Página de login + ações de auth

**Files:** Create: `src/app/admin/login/page.tsx`, `src/app/admin/actions/auth.ts`

**Interfaces:** Produces: server actions `login(formData)`, `logout()`.

- [ ] **Passo 1: Criar `src/app/admin/actions/auth.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) redirect("/admin/login?erro=1");
  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
```

- [ ] **Passo 2: Criar `src/app/admin/login/page.tsx`**

```tsx
import { login } from "@/app/admin/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-4">
      <form action={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="font-heading text-2xl font-extrabold text-navy">Painel Náutica Color</h1>
        <p className="mt-1 text-sm text-ink/60">Entre com a senha de administrador.</p>
        {erro ? <p className="mt-4 rounded-lg bg-red/10 px-3 py-2 text-sm text-red">Senha incorreta.</p> : null}
        <input type="password" name="password" required autoFocus placeholder="Senha"
          className="mt-4 w-full rounded-full border border-navy/15 px-4 py-3 outline-none focus:border-navy" />
        <button type="submit" className="mt-4 h-12 w-full rounded-full bg-red font-semibold text-white transition hover:bg-red-bright">
          Entrar
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Passo 3: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 4: Commit**

```bash
git add src/app/admin/login/page.tsx src/app/admin/actions/auth.ts
git commit -m "feat(admin): tela de login e acoes de auth"
```

---

### Task 2.5: Layout do admin + início (dashboard)

**Files:** Create: `src/app/admin/layout.tsx`, `src/app/admin/login/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/_components/AdminNav.tsx`

**Interfaces:** Consumes: `logout`.

- [ ] **Passo 1: Criar `src/app/admin/_components/AdminNav.tsx`**

```tsx
import Link from "next/link";
import { logout } from "@/app/admin/actions/auth";

const LINKS = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/conteudo", label: "Conteúdo do site" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/historico", label: "Histórico" }
];

export function AdminNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 bg-white px-6 py-4">
      <Link href="/admin" className="font-heading text-lg font-extrabold text-navy">Painel Náutica Color</Link>
      <nav className="flex flex-wrap items-center gap-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-semibold text-navy/80 transition hover:bg-sky">
            {l.label}
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-red transition hover:bg-red/10">Sair</button>
        </form>
      </nav>
    </header>
  );
}
```

- [ ] **Passo 2: Criar `src/app/admin/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { AdminNav } from "@/app/admin/_components/AdminNav";

export const dynamic = "force-dynamic"; // painel nunca é cacheado

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Passo 3: Criar `src/app/admin/login/layout.tsx`** (sobrescreve o layout do admin na rota de login, sem a nav)

```tsx
import type { ReactNode } from "react";
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Passo 4: Criar `src/app/admin/page.tsx`**

```tsx
import Link from "next/link";

const CARDS = [
  { href: "/admin/produtos", title: "Produtos", desc: "Editar nome, foto, preço, disponibilidade e categoria." },
  { href: "/admin/conteudo", title: "Conteúdo do site", desc: "Hero (fundo, título, descrição) e contato." },
  { href: "/admin/marcas", title: "Marcas parceiras", desc: "Logos exibidos na seção Marcas." },
  { href: "/admin/historico", title: "Histórico", desc: "Ver alterações e desfazer." }
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Início</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
            <h2 className="font-heading text-xl font-bold text-navy">{c.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Passo 5: Manual** — `npm run dev`: `/admin` → redireciona a `/admin/login`; senha errada → "Senha incorreta"; senha certa → início; "Sair" → volta ao login.
- [ ] **Passo 6: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/login/layout.tsx src/app/admin/page.tsx src/app/admin/_components/AdminNav.tsx
git commit -m "feat(admin): layout, inicio e navegacao do painel"
```

---

# FASE 3 — Produtos (entrega o pedido principal)

### Task 3.1: Lib de upload de imagem (Vercel Blob)

**Files:** Create: `src/lib/blob.ts`

**Interfaces:** Produces: `uploadImage(file: File, prefix: string): Promise<string>` (URL pública; lança em tipo/tamanho inválido).

- [ ] **Passo 1: Criar `src/lib/blob.ts`**

```ts
import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadImage(file: File, prefix: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Formato inválido. Envie JPG, PNG, WEBP ou AVIF.");
  if (file.size > MAX_BYTES) throw new Error("Imagem muito grande (máx. 5 MB).");
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const blob = await put(`${prefix}/${Date.now()}-${safeName}`, file, { access: "public" });
  return blob.url;
}
```

- [ ] **Passo 2: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 3: Commit**

```bash
git add src/lib/blob.ts
git commit -m "feat(admin): upload de imagem para o Vercel Blob"
```

---

### Task 3.2: Helper de histórico + `computeUndo` (TDD da lógica de undo)

**Files:** Create: `src/db/changelog.ts`, `src/db/changelog.test.ts`

**Interfaces:** Produces: `recordChange({entityType, entityId, action, before, after})`, `computeUndo(entry): { op: "restore"|"recreate"|"delete"; data }`.

- [ ] **Passo 1: Teste que falha — `src/db/changelog.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { computeUndo } from "./changelog";

describe("computeUndo", () => {
  it("update → restaura o estado anterior", () => {
    expect(computeUndo({ action: "update", snapshotBefore: { name: "A" }, snapshotAfter: { name: "B" } }))
      .toEqual({ op: "restore", data: { name: "A" } });
  });
  it("delete → recria o registro anterior", () => {
    expect(computeUndo({ action: "delete", snapshotBefore: { id: 1 }, snapshotAfter: null }))
      .toEqual({ op: "recreate", data: { id: 1 } });
  });
  it("create → apaga o registro criado", () => {
    expect(computeUndo({ action: "create", snapshotBefore: null, snapshotAfter: { id: 2 } }))
      .toEqual({ op: "delete", data: { id: 2 } });
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar** — Run: `npm test -- src/db/changelog.test.ts` → FAIL.

- [ ] **Passo 3: Implementar `src/db/changelog.ts`**

```ts
import { db } from "./client";
import { changeLog } from "./schema";

export async function recordChange(input: {
  entityType: string; entityId: string;
  action: "create" | "update" | "delete";
  before: unknown; after: unknown;
}): Promise<void> {
  await db.insert(changeLog).values({
    entityType: input.entityType, entityId: input.entityId, action: input.action,
    snapshotBefore: input.before as object | null, snapshotAfter: input.after as object | null
  });
}

// Lógica pura: dada uma entrada do log, o que fazer para desfazer.
export function computeUndo(entry: { action: string; snapshotBefore: unknown; snapshotAfter: unknown }):
  { op: "restore" | "recreate" | "delete"; data: unknown } {
  if (entry.action === "update") return { op: "restore", data: entry.snapshotBefore };
  if (entry.action === "delete") return { op: "recreate", data: entry.snapshotBefore };
  return { op: "delete", data: entry.snapshotAfter };
}
```

- [ ] **Passo 4: Rodar e ver passar** — Run: `npm test -- src/db/changelog.test.ts` → PASS.
- [ ] **Passo 5: Commit**

```bash
git add src/db/changelog.ts src/db/changelog.test.ts
git commit -m "feat(admin): historico (recordChange) e logica de desfazer com teste"
```

---

### Task 3.3: Server actions de produtos

**Files:** Create: `src/app/admin/produtos/actions.ts`

**Interfaces:**
- Consumes: `db`, `products`, `recordChange`, `uploadImage`, `PRODUCTS_TAG`, `parseReaisToCents`.
- Produces (todas revalidam `PRODUCTS_TAG`, `/`, `/produtos`): `updateProductAction(formData)`, `createProductAction(formData)`, `deleteProductAction(formData)`.
  - Campos do form: `id` (update/delete), `name`, `precoReais`, `stockStatus`, `brandName`, `categorySlug`, `sku` (create), `unit` (create), `imagem?` (File).

- [ ] **Passo 1: Criar `src/app/admin/produtos/actions.ts`**

```ts
"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { parseReaisToCents } from "@/lib/money";
import { PRODUCTS_TAG } from "@/db/queries/products";

function revalidate() {
  revalidateTag(PRODUCTS_TAG);
  revalidatePath("/");
  revalidatePath("/produtos");
}

async function readImage(formData: FormData, prefix: string): Promise<string | null> {
  const file = formData.get("imagem");
  if (file instanceof File && file.size > 0) return uploadImage(file, prefix);
  return null;
}

function readCommonFields(formData: FormData) {
  const priceCents = parseReaisToCents(String(formData.get("precoReais") ?? ""));
  if (priceCents === null) throw new Error("Preço inválido.");
  return {
    name: String(formData.get("name") ?? "").trim(),
    brandName: String(formData.get("brandName") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    stockStatus: String(formData.get("stockStatus") ?? "available"),
    priceCents
  };
}

export async function updateProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) throw new Error("Produto não encontrado.");
  const fields = readCommonFields(formData);
  const newImage = await readImage(formData, "produtos");
  const [after] = await db.update(products)
    .set({ ...fields, imageUrl: newImage ?? before.imageUrl, updatedAt: new Date() })
    .where(eq(products.id, id)).returning();
  await recordChange({ entityType: "product", entityId: String(id), action: "update", before, after });
  revalidate();
}

export async function createProductAction(formData: FormData) {
  const fields = readCommonFields(formData);
  const newImage = await readImage(formData, "produtos");
  const [after] = await db.insert(products).values({
    sku: String(formData.get("sku") ?? "").trim(),
    ...fields, unit: String(formData.get("unit") ?? "UN"), imageUrl: newImage ?? ""
  }).returning();
  await recordChange({ entityType: "product", entityId: String(after.id), action: "create", before: null, after });
  revalidate();
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) return;
  await db.delete(products).where(eq(products.id, id));
  await recordChange({ entityType: "product", entityId: String(id), action: "delete", before, after: null });
  revalidate();
}
```

- [ ] **Passo 2: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 3: Commit**

```bash
git add src/app/admin/produtos/actions.ts
git commit -m "feat(admin): server actions de produtos (criar/editar/remover)"
```

---

### Task 3.4: Componentes do editor de produto

**Files:** Create: `src/app/admin/_components/ImageUploader.tsx`, `src/app/admin/_components/ProductRow.tsx`

**Interfaces:**
- Consumes: `updateProductAction`, `deleteProductAction`, `centsToReaisInput`, `Category`.
- Produces: `<ImageUploader current? name? />`, `<ProductRow product={Product} categories={Category[]} />` (client).

- [ ] **Passo 1: Criar `src/app/admin/_components/ImageUploader.tsx`**

```tsx
"use client";
import { useState } from "react";

// Mostra a foto atual e um seletor de arquivo com preview. Input com name configurável.
export function ImageUploader({ current, name = "imagem" }: { current?: string; name?: string }) {
  const [preview, setPreview] = useState<string | undefined>(current);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1 block text-xs font-semibold text-ink/60">Foto</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-navy/10" />
      ) : (
        <span className="grid h-20 w-20 place-items-center rounded-xl bg-sky text-xs text-ink/50">sem foto</span>
      )}
      <input type="file" name={name} accept="image/*" className="mt-2 block w-full text-xs"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
    </label>
  );
}
```

- [ ] **Passo 2: Criar `src/app/admin/_components/ProductRow.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { Product, Category } from "@/data/catalog";
import { centsToReaisInput } from "@/lib/money";
import { ImageUploader } from "./ImageUploader";
import { updateProductAction, deleteProductAction } from "@/app/admin/produtos/actions";

export function ProductRow({ product, categories }: { product: Product; categories: Category[] }) {
  const [saving, setSaving] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  return (
    <form
      action={async (fd) => { setSaving(true); try { await updateProductAction(fd); } finally { setSaving(false); } }}
      className="grid grid-cols-1 items-end gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[auto_2fr_1fr_1fr_1fr_auto]"
    >
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="brandName" defaultValue={product.brandName} />
      <ImageUploader current={product.imageUrl} />
      <label className="text-xs font-semibold text-ink/60">Nome
        <input name="name" defaultValue={product.name} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Preço (R$)
        <input name="precoReais" defaultValue={centsToReaisInput(product.priceCents)} placeholder="Sob consulta"
          className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Disponibilidade
        <select name="stockStatus" defaultValue={product.stockStatus} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          <option value="available">Disponível</option>
          <option value="on_request">Sob consulta</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-ink/60">Categoria
        <select name="categorySlug" defaultValue={product.categorySlug} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {saving ? "..." : "Salvar"}
        </button>
        {confirmar ? (
          <button formAction={deleteProductAction} className="rounded-full bg-red px-3 py-2 text-xs font-semibold text-white">Confirmar</button>
        ) : (
          <button type="button" onClick={() => setConfirmar(true)} className="rounded-full px-3 py-2 text-xs font-semibold text-red">Remover</button>
        )}
      </div>
    </form>
  );
}
```

> Nota: sem `confirm()`/`alert()` (dialogs bloqueiam a automação). A confirmação de remoção usa estado (`confirmar`) que troca o botão. A marca fica em campo oculto (não exposta na UI de produtos por padrão).

- [ ] **Passo 3: Verificar** — Run: `npm run typecheck` → sem erros.
- [ ] **Passo 4: Commit**

```bash
git add src/app/admin/_components/ImageUploader.tsx src/app/admin/_components/ProductRow.tsx
git commit -m "feat(admin): componentes de edicao de produto (linha + uploader)"
```

---

### Task 3.5: Página de produtos (busca + filtro + paginação + adicionar)

**Files:** Create: `src/app/admin/produtos/page.tsx`

**Interfaces:** Consumes: `getAllProducts`, `categories`, `paginate`, `ProductRow`, `ImageUploader`, `createProductAction`.

- [ ] **Passo 1: Criar `src/app/admin/produtos/page.tsx`**

```tsx
import Link from "next/link";
import { getAllProducts, categories, paginate } from "@/data/catalog";
import { ProductRow } from "@/app/admin/_components/ProductRow";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { createProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProdutos({
  searchParams
}: { searchParams: Promise<{ q?: string; cat?: string; page?: string }> }) {
  const { q = "", cat = "", page = "1" } = await searchParams;
  const all = await getAllProducts();
  const termo = q.trim().toLowerCase();
  const filtered = all.filter((p) =>
    (cat ? p.categorySlug === cat : true) &&
    (termo ? (p.name.toLowerCase().includes(termo) || p.sku.toLowerCase().includes(termo)) : true)
  );
  const pageData = paginate(filtered, Number(page) || 1, 20);

  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Produtos ({filtered.length})</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou código"
          className="min-w-[240px] flex-1 rounded-full border border-navy/15 px-4 py-2 text-sm" />
        <select name="cat" defaultValue={cat} className="rounded-full border border-navy/15 px-4 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <details className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-semibold text-navy">+ Adicionar produto</summary>
        <form action={createProductAction} className="mt-4 grid gap-3 sm:grid-cols-[auto_2fr_1fr_1fr_1fr]">
          <ImageUploader />
          <input name="name" required placeholder="Nome" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <input name="precoReais" placeholder="Preço (R$)" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <select name="categorySlug" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input name="sku" placeholder="Código (opcional)" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <button className="rounded-full bg-red px-4 py-2 text-xs font-semibold text-white">Adicionar</button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {pageData.items.map((p) => <ProductRow key={p.id} product={p} categories={categories} />)}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: pageData.totalPages }, (_, i) => i + 1)
          .filter((n) => Math.abs(n - pageData.page) < 4 || n === 1 || n === pageData.totalPages)
          .map((n) => (
            <Link key={n} href={`/admin/produtos?q=${encodeURIComponent(q)}&cat=${cat}&page=${n}`}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm ${n === pageData.page ? "bg-navy text-white" : "text-navy hover:bg-sky"}`}>
              {n}
            </Link>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Passo 2: Verificar build** — Run: `npm run typecheck && npm run build` → passa.
- [ ] **Passo 3: Teste manual do fluxo principal** — `npm run dev`: logar → `/admin/produtos` → buscar/filtrar/paginar. Editar preço e Salvar → conferir no site. Trocar foto e Salvar → conferir. Adicionar produto → conferir. Remover (Remover → Confirmar) → conferir.
- [ ] **Passo 4: Commit**

```bash
git add src/app/admin/produtos/page.tsx
git commit -m "feat(admin): tela de produtos (busca, filtro, paginacao, adicionar)"
```

---

# FASE 4 — Conteúdo do site + marcas

### Task 4.1: Leituras e ações de conteúdo/marcas

**Files:** Create: `src/db/queries/content.ts`, `src/db/queries/brands.ts`, `src/app/admin/conteudo/actions.ts`, `src/app/admin/marcas/actions.ts`

**Interfaces:**
- Produces: `getSiteContent(): Promise<Record<string,string>>` + `CONTENT_TAG`; `getBrands(): Promise<PartnerBrandRow[]>` + `BRANDS_TAG`; `updateContentAction(formData)`; `createBrandAction(formData)`, `deleteBrandAction(formData)`.

- [ ] **Passo 1: `src/db/queries/content.ts`**

```ts
import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";

export const CONTENT_TAG = "site-content";

export const getSiteContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await db.select().from(siteContent);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["site-content"], { tags: [CONTENT_TAG] }
);
```

- [ ] **Passo 2: `src/db/queries/brands.ts`**

```ts
import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { partnerBrands } from "@/db/schema";
import type { PartnerBrandRow } from "@/db/schema";

export const BRANDS_TAG = "brands";

export const getBrands = unstable_cache(
  async (): Promise<PartnerBrandRow[]> => db.select().from(partnerBrands).orderBy(asc(partnerBrands.sortOrder)),
  ["brands"], { tags: [BRANDS_TAG] }
);
```

- [ ] **Passo 3: `src/app/admin/conteudo/actions.ts`**

```ts
"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { CONTENT_TAG } from "@/db/queries/content";

const TEXT_KEYS = ["company_name","location","phone","whatsapp_1","whatsapp_2","instagram","hero_title","hero_description"];

async function snapshot(): Promise<Record<string, string>> {
  return Object.fromEntries((await db.select().from(siteContent)).map((r) => [r.key, r.value]));
}

export async function updateContentAction(formData: FormData) {
  const before = await snapshot();
  for (const key of TEXT_KEYS) {
    const value = String(formData.get(key) ?? "");
    await db.insert(siteContent).values({ key, value })
      .onConflictDoUpdate({ target: siteContent.key, set: { value } });
  }
  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    const url = await uploadImage(heroFile, "hero");
    await db.insert(siteContent).values({ key: "hero_image", value: url })
      .onConflictDoUpdate({ target: siteContent.key, set: { value: url } });
  }
  const after = await snapshot();
  await recordChange({ entityType: "site_content", entityId: "site", action: "update", before, after });
  revalidateTag(CONTENT_TAG);
  revalidatePath("/");
}
```

- [ ] **Passo 4: `src/app/admin/marcas/actions.ts`**

```ts
"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { partnerBrands } from "@/db/schema";
import { recordChange } from "@/db/changelog";
import { uploadImage } from "@/lib/blob";
import { BRANDS_TAG } from "@/db/queries/brands";

function revalidate() { revalidateTag(BRANDS_TAG); revalidatePath("/"); }

export async function createBrandAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("logo");
  const logoUrl = file instanceof File && file.size > 0 ? await uploadImage(file, "marcas") : "";
  const [after] = await db.insert(partnerBrands).values({ name, logoUrl, sortOrder: 999 }).returning();
  await recordChange({ entityType: "partner_brand", entityId: String(after.id), action: "create", before: null, after });
  revalidate();
}

export async function deleteBrandAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const [before] = await db.select().from(partnerBrands).where(eq(partnerBrands.id, id));
  if (!before) return;
  await db.delete(partnerBrands).where(eq(partnerBrands.id, id));
  await recordChange({ entityType: "partner_brand", entityId: String(id), action: "delete", before, after: null });
  revalidate();
}
```

- [ ] **Passo 5: Verificar + commit** — Run: `npm run typecheck` → sem erros.

```bash
git add src/db/queries/content.ts src/db/queries/brands.ts src/app/admin/conteudo/actions.ts src/app/admin/marcas/actions.ts
git commit -m "feat(admin): leituras e acoes de conteudo do site e marcas"
```

---

### Task 4.2: Tela de conteúdo do site (hero + contato)

**Files:** Create: `src/app/admin/conteudo/page.tsx`

- [ ] **Passo 1: Criar `src/app/admin/conteudo/page.tsx`**

```tsx
import { getSiteContent } from "@/db/queries/content";
import { updateContentAction } from "./actions";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";

export const dynamic = "force-dynamic";

const CAMPOS: { key: string; label: string }[] = [
  { key: "hero_title", label: "Título do hero" },
  { key: "hero_description", label: "Descrição do hero" },
  { key: "company_name", label: "Nome da empresa" },
  { key: "location", label: "Endereço" },
  { key: "phone", label: "Telefone" },
  { key: "whatsapp_1", label: "WhatsApp 1" },
  { key: "whatsapp_2", label: "WhatsApp 2" },
  { key: "instagram", label: "Instagram" }
];

export default async function AdminConteudo() {
  const c = await getSiteContent();
  return (
    <form action={updateContentAction} className="max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold text-navy">Conteúdo do site</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <ImageUploader current={c.hero_image} name="hero_image" />
        <div className="mt-4 grid gap-4">
          {CAMPOS.map((f) => (
            <label key={f.key} className="text-sm font-semibold text-ink/70">{f.label}
              <input name={f.key} defaultValue={c[f.key] ?? ""} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-ink" />
            </label>
          ))}
        </div>
        <button className="mt-6 h-11 rounded-full bg-red px-6 font-semibold text-white">Salvar</button>
      </div>
    </form>
  );
}
```

- [ ] **Passo 2: Verificar + commit** — Run: `npm run typecheck` → sem erros.

```bash
git add src/app/admin/conteudo/page.tsx
git commit -m "feat(admin): tela de conteudo do site (hero + contato)"
```

---

### Task 4.3: Tela de marcas

**Files:** Create: `src/app/admin/marcas/page.tsx`

- [ ] **Passo 1: Criar `src/app/admin/marcas/page.tsx`**

```tsx
import { getBrands } from "@/db/queries/brands";
import { createBrandAction, deleteBrandAction } from "./actions";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";

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
```

- [ ] **Passo 2: Verificar + commit** — Run: `npm run typecheck` → sem erros.

```bash
git add src/app/admin/marcas/page.tsx
git commit -m "feat(admin): tela de marcas parceiras"
```

---

### Task 4.4: Site público lê hero/contato/marcas do banco

**Files:** Modify: `src/app/page.tsx`, `src/components/BrandsMarquee.tsx` (e onde `store`/`partnerBrands` são usados)

**Interfaces:** Consumes: `getSiteContent`, `getBrands`.

- [ ] **Passo 1: Levantar os usos** — Run: `grep -rn "@/data/store" src` → anotar cada arquivo (ex.: `page.tsx`, `BrandsMarquee.tsx`).

- [ ] **Passo 2: `src/app/page.tsx`** — no topo do componente async, derivar `store` do banco:

```ts
const content = await getSiteContent();
const store = {
  companyName: content.company_name ?? "Náutica Color",
  location: content.location ?? "",
  phone: content.phone ?? "",
  whatsappVisible: content.whatsapp_1 ?? "",
  whatsappVisible2: content.whatsapp_2 ?? "",
  instagram: content.instagram ?? "",
  heroImage: content.hero_image ?? "/hero/hero-nautica.png"
};
```

Remover o `import { store } from "@/data/store"`. Usar `content.hero_title`/`content.hero_description` nos textos do hero (com os textos atuais como fallback se vazio).

- [ ] **Passo 3: `src/components/BrandsMarquee.tsx`** — receber as marcas via prop de `page.tsx` (`const brands = await getBrands()`) ou torná-lo async e chamar `getBrands()`; mapear `b.logoUrl`/`b.name`.

- [ ] **Passo 4: Verificar build + manual** — Run: `npm run typecheck && npm run build`. Manual: editar telefone e título do hero em `/admin/conteudo`, salvar, ver refletir; adicionar/remover marca e ver na seção Marcas.

- [ ] **Passo 5: Commit**

```bash
git add src/app/page.tsx src/components/BrandsMarquee.tsx
git commit -m "feat(admin): site le hero/contato/marcas do banco"
```

---

# FASE 5 — Histórico e desfazer

### Task 5.1: Leitura do histórico + ação de desfazer

**Files:** Create: `src/db/queries/changelog.ts`, `src/app/admin/historico/actions.ts`

**Interfaces:**
- Produces: `getRecentChanges(limit=100): Promise<ChangeLogRow[]>`; `undoAction(formData)`.
- Consumes: `computeUndo`, `recordChange`, `products`, `partnerBrands`, `siteContent`, tags.

- [ ] **Passo 1: `src/db/queries/changelog.ts`**

```ts
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog } from "@/db/schema";
import type { ChangeLogRow } from "@/db/schema";

export async function getRecentChanges(limit = 100): Promise<ChangeLogRow[]> {
  return db.select().from(changeLog).orderBy(desc(changeLog.changedAt)).limit(limit);
}
```

- [ ] **Passo 2: `src/app/admin/historico/actions.ts`**

```ts
"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog, products, partnerBrands, siteContent } from "@/db/schema";
import { computeUndo, recordChange } from "@/db/changelog";
import { PRODUCTS_TAG } from "@/db/queries/products";
import { BRANDS_TAG } from "@/db/queries/brands";
import { CONTENT_TAG } from "@/db/queries/content";

export async function undoAction(formData: FormData) {
  const logId = Number(formData.get("logId"));
  const [entry] = await db.select().from(changeLog).where(eq(changeLog.id, logId));
  if (!entry) return;
  const { op, data } = computeUndo(entry);

  if (entry.entityType === "product") {
    const id = Number(entry.entityId);
    if (op === "restore") { const { id: _i, createdAt, updatedAt, ...rest } = data as any; await db.update(products).set({ ...rest, updatedAt: new Date() }).where(eq(products.id, id)); }
    if (op === "recreate") { const { id: _i, ...rest } = data as any; await db.insert(products).values(rest); }
    if (op === "delete") await db.delete(products).where(eq(products.id, id));
    revalidateTag(PRODUCTS_TAG);
    revalidatePath("/produtos");
  } else if (entry.entityType === "partner_brand") {
    const id = Number(entry.entityId);
    if (op === "restore") { const { id: _i, ...rest } = data as any; await db.update(partnerBrands).set(rest).where(eq(partnerBrands.id, id)); }
    if (op === "recreate") { const { id: _i, ...rest } = data as any; await db.insert(partnerBrands).values(rest); }
    if (op === "delete") await db.delete(partnerBrands).where(eq(partnerBrands.id, id));
    revalidateTag(BRANDS_TAG);
  } else if (entry.entityType === "site_content") {
    const map = data as Record<string, string>;
    for (const [key, value] of Object.entries(map)) {
      await db.insert(siteContent).values({ key, value }).onConflictDoUpdate({ target: siteContent.key, set: { value } });
    }
    revalidateTag(CONTENT_TAG);
  }

  // Registra a própria reversão como nova entrada (permite refazer).
  await recordChange({ entityType: entry.entityType, entityId: entry.entityId, action: "update", before: entry.snapshotAfter, after: entry.snapshotBefore });
  revalidatePath("/");
}
```

- [ ] **Passo 3: Verificar + commit** — Run: `npm run typecheck` → sem erros.

```bash
git add src/db/queries/changelog.ts src/app/admin/historico/actions.ts
git commit -m "feat(admin): leitura do historico e acao de desfazer"
```

---

### Task 5.2: Tela de histórico

**Files:** Create: `src/app/admin/historico/page.tsx`

- [ ] **Passo 1: Criar `src/app/admin/historico/page.tsx`**

```tsx
import { getRecentChanges } from "@/db/queries/changelog";
import { undoAction } from "./actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { product: "Produto", partner_brand: "Marca", site_content: "Conteúdo do site" };
const ACAO: Record<string, string> = { create: "Criou", update: "Alterou", delete: "Removeu" };

export default async function AdminHistorico() {
  const changes = await getRecentChanges();
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Histórico</h1>
      <div className="mt-6 space-y-2">
        {changes.map((c) => {
          const nome = (c.snapshotAfter as any)?.name ?? (c.snapshotBefore as any)?.name ?? c.entityId;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-ink/80">
                <span className="font-semibold text-navy">{ACAO[c.action] ?? c.action}</span>{" "}
                {LABEL[c.entityType] ?? c.entityType}: <span className="font-medium">{String(nome)}</span>
                <span className="ml-2 text-xs text-ink/50">{new Date(c.changedAt).toLocaleString("pt-BR")}</span>
              </div>
              <form action={undoAction}>
                <input type="hidden" name="logId" value={c.id} />
                <button className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-sky">Desfazer</button>
              </form>
            </div>
          );
        })}
        {changes.length === 0 ? <p className="text-sm text-ink/60">Nenhuma alteração ainda.</p> : null}
      </div>
    </div>
  );
}
```

- [ ] **Passo 2: Verificar build + manual** — Run: `npm run typecheck && npm run build`. Manual: alterar preço de um produto → Histórico → "Desfazer" → conferir que voltou no site.
- [ ] **Passo 3: Commit**

```bash
git add src/app/admin/historico/page.tsx
git commit -m "feat(admin): tela de historico com desfazer"
```

---

## Verificação final (todas as fases)

- [ ] `npm test` — testes de lógica (money, auth, mapper, undo) passam.
- [ ] `npm run typecheck && npm run build` — passam.
- [ ] Banco tem **1504** produtos após a semente.
- [ ] Fluxo completo (manual): login → editar preço/foto de produto → refletir no site na hora → adicionar/remover produto → editar hero/contato → adicionar/remover marca → desfazer no histórico.
- [ ] Segurança: `/admin` sem cookie → redireciona para `/admin/login`; senha errada → mensagem de erro.
- [ ] Deploy na Vercel com as 4 env vars; rodar `db:migrate` e `db:seed` uma vez contra o banco de produção.

## Notas de deploy

- Env vars (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET`) em Production/Preview/Development.
- A semente (`db:seed`) roda **uma vez** contra o banco de produção (localmente com `vercel env pull`, ou por um job pontual). Depois, o catálogo vive no banco.
- Os arquivos `src/data/products/*.ts` ficam como backup da semente inicial; podem ser removidos numa limpeza futura (fora do escopo).
