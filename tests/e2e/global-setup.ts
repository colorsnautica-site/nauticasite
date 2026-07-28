import postgres from "postgres";

export default async function globalSetup() {
  const url = process.env.TEST_DATABASE_URL!;
  if (!url || url === process.env.__ORIGINAL_DATABASE_URL) throw new Error("Banco E2E inseguro.");
  const sql = postgres(url, { prepare: false });
  try {
    await sql`TRUNCATE TABLE admin_login_attempts, change_log, products, site_content, partner_brands RESTART IDENTITY CASCADE`;
    await sql`
      INSERT INTO products (sku,name,category_slug,brand_name,price_cents,unit,stock_status,image_url,sort_order)
      VALUES ('E2E-BASE','Produto base E2E','linha-nautica','Marca E2E',1000,'UN','available','',0)
    `;
    await sql`INSERT INTO site_content (key,value) VALUES
      ('company_name','Náutica Color E2E'),
      ('location','Marina de Teste'),
      ('phone','+552424044606'),
      ('whatsapp_1','+5524998447844'),
      ('whatsapp_2','+5524993037332'),
      ('instagram','@nauticacolor'),
      ('hero_image','/hero/hero-nautica.png'),
      ('hero_title','Hero E2E'),
      ('hero_description','Descrição controlada do ambiente E2E.')
    `;
    await sql`INSERT INTO partner_brands (name,logo_url,sort_order) VALUES ('Marca E2E','/brand/marcas/3m.webp',0)`;
  } finally {
    await sql.end();
  }
}
