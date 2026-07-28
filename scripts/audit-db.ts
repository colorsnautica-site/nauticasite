import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida.");
const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  try {
    const [products, brands, history, duplicateSkus, invalidProducts] = await Promise.all([
      sql.unsafe("select count(*)::int count from products"),
      sql.unsafe("select count(*)::int count from partner_brands"),
      sql.unsafe("select count(*)::int count from change_log"),
      sql.unsafe("select count(*)::int count from (select sku from products where btrim(sku)<>'' group by sku having count(*)>1) duplicate_skus"),
      sql.unsafe("select count(*)::int count from products where price_cents<0 or stock_status not in ('available','on_request') or category_slug not in ('linha-nautica','linha-automotiva','adesivos-e-selantes','polimento','abrasivos','acessorios','ferramentas') or char_length(name)>255 or char_length(brand_name)>120 or char_length(sku)>80 or char_length(unit)>16")
    ]);
    console.log(JSON.stringify({
      products: products[0].count,
      brands: brands[0].count,
      history: history[0].count,
      duplicateSkuGroups: duplicateSkus[0].count,
      invalidProducts: invalidProducts[0].count
    }));
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
