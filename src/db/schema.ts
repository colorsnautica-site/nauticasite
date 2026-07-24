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
