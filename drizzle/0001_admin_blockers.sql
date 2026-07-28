ALTER TABLE "change_log" ADD COLUMN "archived_at" timestamp;
ALTER TABLE "change_log" ADD COLUMN "reverted_at" timestamp;
ALTER TABLE "change_log" ADD COLUMN "reversal_of_id" integer;
--> statement-breakpoint
UPDATE "change_log"
SET "archived_at" = COALESCE("archived_at", now())
WHERE "archived_at" IS NULL;
UPDATE "site_content"
SET "value" = '+55' || regexp_replace("value", '[^0-9]', '', 'g')
WHERE "key" IN ('phone', 'whatsapp_1', 'whatsapp_2')
  AND char_length(regexp_replace("value", '[^0-9]', '', 'g')) IN (10, 11);
--> statement-breakpoint
CREATE TABLE "admin_login_attempts" (
	"identifier_hash" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"blocked_until" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_login_attempts_hash_length" CHECK (char_length("identifier_hash") = 64),
	CONSTRAINT "admin_login_attempts_count_range" CHECK ("attempt_count" between 0 and 5)
);
--> statement-breakpoint
ALTER TABLE "change_log"
  ADD CONSTRAINT "change_log_reversal_of_id_change_log_id_fk"
  FOREIGN KEY ("reversal_of_id") REFERENCES "public"."change_log"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_length" CHECK (char_length("sku") <= 80);
ALTER TABLE "products" ADD CONSTRAINT "products_name_length" CHECK (char_length(btrim("name")) between 1 and 255);
ALTER TABLE "products" ADD CONSTRAINT "products_brand_length" CHECK (char_length("brand_name") <= 120);
ALTER TABLE "products" ADD CONSTRAINT "products_category_allowed" CHECK ("category_slug" in ('linha-nautica','linha-automotiva','adesivos-e-selantes','polimento','abrasivos','acessorios','ferramentas'));
ALTER TABLE "products" ADD CONSTRAINT "products_price_nonnegative" CHECK ("price_cents" between 0 and 999999999);
ALTER TABLE "products" ADD CONSTRAINT "products_unit_length" CHECK (char_length(btrim("unit")) between 1 and 16);
ALTER TABLE "products" ADD CONSTRAINT "products_stock_status_allowed" CHECK ("stock_status" in ('available','on_request'));
ALTER TABLE "products" ADD CONSTRAINT "products_image_url_length" CHECK (char_length("image_url") <= 2048);
ALTER TABLE "products" ADD CONSTRAINT "products_sort_order_nonnegative" CHECK ("sort_order" >= 0);
--> statement-breakpoint
ALTER TABLE "site_content" ADD CONSTRAINT "site_content_key_allowed" CHECK ("key" in ('company_name','location','phone','whatsapp_1','whatsapp_2','instagram','hero_image','hero_title','hero_description'));
ALTER TABLE "site_content" ADD CONSTRAINT "site_content_value_length" CHECK (char_length("value") <= 5000);
--> statement-breakpoint
ALTER TABLE "partner_brands" ADD CONSTRAINT "partner_brands_name_length" CHECK (char_length(btrim("name")) between 1 and 120);
ALTER TABLE "partner_brands" ADD CONSTRAINT "partner_brands_logo_length" CHECK (char_length(btrim("logo_url")) between 1 and 2048);
ALTER TABLE "partner_brands" ADD CONSTRAINT "partner_brands_sort_nonnegative" CHECK ("sort_order" >= 0);
--> statement-breakpoint
ALTER TABLE "change_log" ADD CONSTRAINT "change_log_entity_type_allowed" CHECK ("entity_type" in ('product','site_content','partner_brand'));
ALTER TABLE "change_log" ADD CONSTRAINT "change_log_action_allowed" CHECK ("action" in ('create','update','delete'));
ALTER TABLE "change_log" ADD CONSTRAINT "change_log_entity_id_length" CHECK (char_length(btrim("entity_id")) between 1 and 80);
--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_unique_nonempty" ON "products" USING btree ("sku") WHERE btrim("sku") <> '';
CREATE INDEX "products_category_sort_idx" ON "products" USING btree ("category_slug", "sort_order", "id");
CREATE INDEX "partner_brands_sort_idx" ON "partner_brands" USING btree ("sort_order", "id");
CREATE INDEX "change_log_active_changed_idx" ON "change_log" USING btree ("archived_at", "changed_at");
CREATE INDEX "change_log_reversal_idx" ON "change_log" USING btree ("reversal_of_id");
CREATE INDEX "admin_login_attempts_updated_idx" ON "admin_login_attempts" USING btree ("updated_at");
