import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const CATEGORY_SLUGS = [
  "linha-nautica",
  "linha-automotiva",
  "adesivos-e-selantes",
  "polimento",
  "abrasivos",
  "acessorios",
  "ferramentas"
] as const;

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
}, (table) => [
  uniqueIndex("products_sku_unique_nonempty")
    .on(table.sku)
    .where(sql`btrim(${table.sku}) <> ''`),
  index("products_category_sort_idx").on(table.categorySlug, table.sortOrder, table.id),
  check("products_sku_length", sql`char_length(${table.sku}) <= 80`),
  check("products_name_length", sql`char_length(btrim(${table.name})) between 1 and 255`),
  check("products_brand_length", sql`char_length(${table.brandName}) <= 120`),
  check("products_category_allowed", sql`${table.categorySlug} in ('linha-nautica','linha-automotiva','adesivos-e-selantes','polimento','abrasivos','acessorios','ferramentas')`),
  check("products_price_nonnegative", sql`${table.priceCents} between 0 and 999999999`),
  check("products_unit_length", sql`char_length(btrim(${table.unit})) between 1 and 16`),
  check("products_stock_status_allowed", sql`${table.stockStatus} in ('available','on_request')`),
  check("products_image_url_length", sql`char_length(${table.imageUrl}) <= 2048`),
  check("products_sort_order_nonnegative", sql`${table.sortOrder} >= 0`)
]);

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default("")
}, (table) => [
  check("site_content_key_allowed", sql`${table.key} in ('company_name','location','phone','whatsapp_1','whatsapp_2','instagram','hero_image','hero_title','hero_description')`),
  check("site_content_value_length", sql`char_length(${table.value}) <= 5000`)
]);

export const partnerBrands = pgTable("partner_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0)
}, (table) => [
  index("partner_brands_sort_idx").on(table.sortOrder, table.id),
  check("partner_brands_name_length", sql`char_length(btrim(${table.name})) between 1 and 120`),
  check("partner_brands_logo_length", sql`char_length(btrim(${table.logoUrl})) between 1 and 2048`),
  check("partner_brands_sort_nonnegative", sql`${table.sortOrder} >= 0`)
]);

export const changeLog = pgTable("change_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  snapshotBefore: jsonb("snapshot_before"),
  snapshotAfter: jsonb("snapshot_after"),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
  archivedAt: timestamp("archived_at"),
  revertedAt: timestamp("reverted_at"),
  reversalOfId: integer("reversal_of_id")
}, (table) => [
  index("change_log_active_changed_idx").on(table.archivedAt, table.changedAt),
  index("change_log_reversal_idx").on(table.reversalOfId),
  check("change_log_entity_type_allowed", sql`${table.entityType} in ('product','site_content','partner_brand')`),
  check("change_log_action_allowed", sql`${table.action} in ('create','update','delete')`),
  check("change_log_entity_id_length", sql`char_length(btrim(${table.entityId})) between 1 and 80`),
  foreignKey({
    columns: [table.reversalOfId],
    foreignColumns: [table.id],
    name: "change_log_reversal_of_id_change_log_id_fk"
  }).onDelete("set null")
]);

export const adminLoginAttempts = pgTable("admin_login_attempts", {
  identifierHash: text("identifier_hash").primaryKey(),
  windowStartedAt: timestamp("window_started_at").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  blockedUntil: timestamp("blocked_until"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
  index("admin_login_attempts_updated_idx").on(table.updatedAt),
  check("admin_login_attempts_hash_length", sql`char_length(${table.identifierHash}) = 64`),
  check("admin_login_attempts_count_range", sql`${table.attemptCount} between 0 and 5`)
]);

export type ProductRow = typeof products.$inferSelect;
export type PartnerBrandRow = typeof partnerBrands.$inferSelect;
export type ChangeLogRow = typeof changeLog.$inferSelect;
export type AdminLoginAttemptRow = typeof adminLoginAttempts.$inferSelect;
