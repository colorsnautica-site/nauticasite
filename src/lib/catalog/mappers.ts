import type { Brand, Category, Product, SiteSetting, StoreSite } from "@/types/catalog";

type RawRecord = Record<string, unknown>;

export function mapSite(row: RawRecord): StoreSite {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    active: Boolean(row.active)
  };
}

export function mapBrand(row: RawRecord): Brand {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    parentBrandId: row.parent_brand_id ? String(row.parent_brand_id) : null,
    name: String(row.name),
    slug: String(row.slug),
    logoUrl: row.logo_url ? String(row.logo_url) : null,
    description: row.description ? String(row.description) : null,
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

export function mapCategory(row: RawRecord): Category {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

export function mapProduct(row: RawRecord): Product {
  const brand = Array.isArray(row.store_brands) ? row.store_brands[0] : row.store_brands;
  const category = Array.isArray(row.store_categories) ? row.store_categories[0] : row.store_categories;

  return {
    id: String(row.id),
    siteId: String(row.site_id),
    brandId: row.brand_id ? String(row.brand_id) : "",
    categoryId: String(row.category_id),
    sku: String(row.sku),
    slug: String(row.slug),
    name: String(row.name),
    shortDescription: String(row.short_description),
    description: row.description ? String(row.description) : null,
    priceCents: Number(row.price_cents ?? 0),
    unit: String(row.unit),
    imageUrl: row.image_url ? String(row.image_url) : null,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    demoPrice: Boolean(row.demo_price),
    stockStatus: String(row.stock_status ?? "on_request") as Product["stockStatus"],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    brand: brand && typeof brand === "object" ? mapBrand(brand as RawRecord) : undefined,
    category: category && typeof category === "object" ? mapCategory(category as RawRecord) : undefined
  };
}

export function mapSetting(row: RawRecord): SiteSetting {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    key: String(row.key),
    value: row.value,
    isPublic: Boolean(row.is_public)
  };
}

export function stringifySetting(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value) return String((value as { text: unknown }).text);
  return String(value ?? "");
}
