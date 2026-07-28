import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPartnerBrand, deletePartnerBrand, deleteProduct, updateProduct, updateSiteContent, type ProductMutationInput } from "@/db/mutations";
import { undoChange } from "@/db/undo";

const testUrl = process.env.TEST_DATABASE_URL!;
if (!testUrl || testUrl === process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  throw new Error("Banco de teste não configurado com segurança.");
}
const sql = postgres(testUrl, { prepare: false, max: 4 });
let archivedAtMigration = 0;

async function runMigration(file: string) {
  const source = readFileSync(resolve(process.cwd(), "drizzle", file), "utf8");
  for (const statement of source.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
    await sql.unsafe(statement);
  }
}

async function resetRows() {
  await sql`TRUNCATE TABLE admin_login_attempts, change_log, products, site_content, partner_brands RESTART IDENTITY CASCADE`;
}

function input(overrides: Partial<ProductMutationInput> = {}): ProductMutationInput {
  return {
    sku: "TEST-001",
    name: "Produto inicial",
    brandName: "Marca",
    categorySlug: "linha-nautica",
    stockStatus: "available",
    unit: "UN",
    priceCents: 1000,
    ...overrides
  };
}

async function insertProduct(values = input()): Promise<number> {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO products (sku,name,brand_name,category_slug,stock_status,unit,price_cents,image_url,sort_order)
    VALUES (${values.sku},${values.name},${values.brandName},${values.categorySlug},${values.stockStatus},${values.unit},${values.priceCents},'',0)
    RETURNING id
  `;
  return row.id;
}

beforeAll(async () => {
  await sql.unsafe("DROP TABLE IF EXISTS admin_login_attempts, change_log, partner_brands, products, site_content CASCADE");
  await runMigration("0000_mixed_tana_nile.sql");
  for (let index = 1; index <= 23; index++) {
    await sql`INSERT INTO change_log (entity_type,entity_id,action,snapshot_before,snapshot_after) VALUES ('product',${String(index)},'update',${sql.json({ id: index, name: "A" })},${sql.json({ id: index, name: "B" })})`;
  }
  await runMigration("0001_admin_blockers.sql");
  const [count] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM change_log WHERE archived_at IS NOT NULL`;
  archivedAtMigration = count.count;
});

beforeEach(resetRows);
afterAll(async () => { await sql.end(); });

describe("migração", () => {
  it("arquiva as 23 entradas preexistentes sem removê-las", () => {
    expect(archivedAtMigration).toBe(23);
  });
});

describe("transações e histórico", () => {
  it("reverte a alteração inteira quando o histórico falha", async () => {
    const id = await insertProduct();
    await sql.unsafe("CREATE FUNCTION test_fail_change_log() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'history failed'; END $$");
    await sql.unsafe("CREATE TRIGGER test_fail_change_log BEFORE INSERT ON change_log FOR EACH ROW EXECUTE FUNCTION test_fail_change_log()");
    await expect(updateProduct(id, input({ name: "Não deve persistir" }))).rejects.toThrow();
    const [row] = await sql<{ name: string }[]>`SELECT name FROM products WHERE id=${id}`;
    expect(row.name).toBe("Produto inicial");
    await sql.unsafe("DROP TRIGGER test_fail_change_log ON change_log");
    await sql.unsafe("DROP FUNCTION test_fail_change_log()");
  });

  it("faz update, undo e redo usando estados reais", async () => {
    const id = await insertProduct();
    await updateProduct(id, input({ name: "Produto alterado" }));
    const [log] = await sql<{ id: number }[]>`SELECT id FROM change_log ORDER BY id DESC LIMIT 1`;
    await undoChange(log.id);
    expect((await sql<{ name: string }[]>`SELECT name FROM products WHERE id=${id}`)[0].name).toBe("Produto inicial");
    const [reversal] = await sql<{ id: number }[]>`SELECT id FROM change_log WHERE reversal_of_id=${log.id}`;
    await undoChange(reversal.id);
    expect((await sql<{ name: string }[]>`SELECT name FROM products WHERE id=${id}`)[0].name).toBe("Produto alterado");
  });

  it("rejeita estado obsoleto e duplo desfazer", async () => {
    const id = await insertProduct();
    await updateProduct(id, input({ name: "Versão B" }));
    const [first] = await sql<{ id: number }[]>`SELECT id FROM change_log ORDER BY id DESC LIMIT 1`;
    await sql`UPDATE products SET name='Mudança externa' WHERE id=${id}`;
    await expect(undoChange(first.id)).rejects.toThrow(/mudou/);

    await sql`UPDATE products SET name='Versão B' WHERE id=${id}`;
    await undoChange(first.id);
    await expect(undoChange(first.id)).rejects.toThrow(/já foi desfeita/);
  });

  it("recria exclusões com um novo ID e rastreia o ID real", async () => {
    const originalId = await insertProduct();
    await deleteProduct(originalId);
    const [deletion] = await sql<{ id: number }[]>`SELECT id FROM change_log ORDER BY id DESC LIMIT 1`;
    await undoChange(deletion.id);
    const [product] = await sql<{ id: number }[]>`SELECT id FROM products`;
    expect(product.id).not.toBe(originalId);
    const [reversal] = await sql<{ entityId: string }[]>`SELECT entity_id AS "entityId" FROM change_log WHERE reversal_of_id=${deletion.id}`;
    expect(reversal.entityId).toBe(String(product.id));
  });

  it("mantém conteúdo e marcas atômicos", async () => {
    await sql.unsafe("CREATE FUNCTION test_fail_change_log() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'history failed'; END $$");
    await sql.unsafe("CREATE TRIGGER test_fail_change_log BEFORE INSERT ON change_log FOR EACH ROW EXECUTE FUNCTION test_fail_change_log()");
    await expect(updateSiteContent({ company_name: "Não persiste" })).rejects.toThrow();
    expect((await sql`SELECT * FROM site_content`).length).toBe(0);
    await sql.unsafe("DROP TRIGGER test_fail_change_log ON change_log");
    await sql.unsafe("DROP FUNCTION test_fail_change_log()");

    const brand = await createPartnerBrand("Marca teste", "/brand/teste.webp");
    await deletePartnerBrand(brand.id);
    expect((await sql`SELECT * FROM partner_brands`).length).toBe(0);
    expect((await sql`SELECT * FROM change_log WHERE entity_type='partner_brand'`).length).toBe(2);
  });

  it("serializa edições concorrentes no mesmo produto", async () => {
    const id = await insertProduct();
    await Promise.all([
      updateProduct(id, input({ name: "Edição A" })),
      updateProduct(id, input({ name: "Edição B", brandName: "Outra marca" }))
    ]);
    const [count] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM change_log WHERE entity_type='product' AND action='update'`;
    expect(count.count).toBe(2);
    const [row] = await sql<{ name: string }[]>`SELECT name FROM products WHERE id=${id}`;
    expect(["Edição A", "Edição B"]).toContain(row.name);
  });
});
