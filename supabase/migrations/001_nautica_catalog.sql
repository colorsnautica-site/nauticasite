-- Nautica Color catalog migration.
-- Safe for shared Supabase projects: creates only public objects prefixed with store_.
-- Briefing note: there is a WhatsApp divergence. This catalog uses (24) 99844-7844 / 5524998447844,
-- while the briefing also mentions (27) 99244-4944. Confirm the official number before publishing.

create table if not exists public.store_sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_brands (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.store_sites(id) on delete restrict,
  parent_brand_id uuid null references public.store_brands(id) on delete set null,
  name text not null,
  slug text not null,
  logo_url text null,
  description text null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_brands_site_slug_unique unique (site_id, slug)
);

create table if not exists public.store_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.store_sites(id) on delete restrict,
  name text not null,
  slug text not null,
  description text null,
  image_url text null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_categories_site_slug_unique unique (site_id, slug)
);

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.store_sites(id) on delete restrict,
  brand_id uuid not null references public.store_brands(id) on delete restrict,
  category_id uuid not null references public.store_categories(id) on delete restrict,
  sku text not null,
  slug text not null,
  name text not null,
  short_description text not null,
  description text null,
  price_cents integer not null,
  unit text not null,
  image_url text null,
  active boolean not null default true,
  featured boolean not null default false,
  demo_price boolean not null default true,
  stock_status text not null default 'on_request',
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_products_site_slug_unique unique (site_id, slug),
  constraint store_products_site_sku_unique unique (site_id, sku),
  constraint store_products_price_non_negative check (price_cents >= 0),
  constraint store_products_stock_status_check check (stock_status in ('available', 'unavailable', 'on_request'))
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.store_sites(id) on delete restrict,
  key text not null,
  value jsonb not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_settings_site_key_unique unique (site_id, key)
);

create index if not exists store_brands_site_active_idx on public.store_brands(site_id, active, sort_order);
create index if not exists store_categories_site_active_idx on public.store_categories(site_id, active, sort_order);
create index if not exists store_products_site_active_idx on public.store_products(site_id, active, featured, name);
create index if not exists store_products_brand_idx on public.store_products(brand_id);
create index if not exists store_products_category_idx on public.store_products(category_id);
create index if not exists store_products_tags_idx on public.store_products using gin(tags);
create index if not exists store_settings_site_public_idx on public.store_settings(site_id, is_public);

create or replace function public.store_catalog_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.store_catalog_set_updated_at()
from public, anon, authenticated;

drop trigger if exists trg_store_sites_updated_at on public.store_sites;
create trigger trg_store_sites_updated_at
before update on public.store_sites
for each row execute function public.store_catalog_set_updated_at();

drop trigger if exists trg_store_brands_updated_at on public.store_brands;
create trigger trg_store_brands_updated_at
before update on public.store_brands
for each row execute function public.store_catalog_set_updated_at();

drop trigger if exists trg_store_categories_updated_at on public.store_categories;
create trigger trg_store_categories_updated_at
before update on public.store_categories
for each row execute function public.store_catalog_set_updated_at();

drop trigger if exists trg_store_products_updated_at on public.store_products;
create trigger trg_store_products_updated_at
before update on public.store_products
for each row execute function public.store_catalog_set_updated_at();

drop trigger if exists trg_store_settings_updated_at on public.store_settings;
create trigger trg_store_settings_updated_at
before update on public.store_settings
for each row execute function public.store_catalog_set_updated_at();

alter table public.store_sites enable row level security;
alter table public.store_brands enable row level security;
alter table public.store_categories enable row level security;
alter table public.store_products enable row level security;
alter table public.store_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_sites' and policyname = 'store_sites_public_read_active') then
    create policy store_sites_public_read_active on public.store_sites for select to anon, authenticated using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_brands' and policyname = 'store_brands_public_read_active') then
    create policy store_brands_public_read_active on public.store_brands for select to anon, authenticated using (
      active = true and exists (select 1 from public.store_sites s where s.id = site_id and s.active = true)
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_categories' and policyname = 'store_categories_public_read_active') then
    create policy store_categories_public_read_active on public.store_categories for select to anon, authenticated using (
      active = true and exists (select 1 from public.store_sites s where s.id = site_id and s.active = true)
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_products' and policyname = 'store_products_public_read_active') then
    create policy store_products_public_read_active on public.store_products for select to anon, authenticated using (
      active = true and exists (select 1 from public.store_sites s where s.id = site_id and s.active = true)
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_settings' and policyname = 'store_settings_public_read_public') then
    create policy store_settings_public_read_public on public.store_settings for select to anon, authenticated using (
      is_public = true and exists (select 1 from public.store_sites s where s.id = site_id and s.active = true)
    );
  end if;
end $$;

grant select on public.store_sites to anon, authenticated;
grant select on public.store_brands to anon, authenticated;
grant select on public.store_categories to anon, authenticated;
grant select on public.store_products to anon, authenticated;
grant select on public.store_settings to anon, authenticated;

revoke insert, update, delete on public.store_sites from anon, authenticated;
revoke insert, update, delete on public.store_brands from anon, authenticated;
revoke insert, update, delete on public.store_categories from anon, authenticated;
revoke insert, update, delete on public.store_products from anon, authenticated;
revoke insert, update, delete on public.store_settings from anon, authenticated;

insert into public.store_sites (slug, name, active)
values ('nautica-color', 'Náutica Color', true)
on conflict (slug) do update set name = excluded.name, active = excluded.active;

with site as (
  select id from public.store_sites where slug = 'nautica-color'
),
upsert_brands as (
  insert into public.store_brands (site_id, name, slug, sort_order, active)
  select site.id, data.name, data.slug, data.sort_order, true
  from site
  cross join (values
    ('Jotun', 'jotun', 1),
    ('Norton', 'norton', 2),
    ('AkzoNobel', 'akzonobel', 3),
    ('Sikkens', 'sikkens', 4),
    ('Wanda', 'wanda', 5),
    ('Colorgel Marine', 'colorgel-marine', 6)
  ) as data(name, slug, sort_order)
  on conflict (site_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order, active = true
  returning id, slug
)
update public.store_brands child
set parent_brand_id = parent.id
from public.store_brands parent, site
where child.site_id = site.id
  and parent.site_id = site.id
  and parent.slug = 'akzonobel'
  and child.slug in ('sikkens', 'wanda');

with site as (
  select id from public.store_sites where slug = 'nautica-color'
)
insert into public.store_categories (site_id, name, slug, sort_order, active)
select site.id, data.name, data.slug, data.sort_order, true
from site
cross join (values
  ('Tintas de fundo e primers', 'tintas-de-fundo-e-primers', 1),
  ('Antifouling', 'antifouling', 2),
  ('Vernizes e acabamentos', 'vernizes-e-acabamentos', 3),
  ('Lixas e abrasivos', 'lixas-e-abrasivos', 4),
  ('Fiberglass e compósitos', 'fiberglass-e-compositos', 5),
  ('Limpeza, proteção e polimento', 'limpeza-protecao-e-polimento', 6)
) as data(name, slug, sort_order)
on conflict (site_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order, active = true;

with site as (
  select id from public.store_sites where slug = 'nautica-color'
)
insert into public.store_settings (site_id, key, value, is_public)
select site.id, data.key, to_jsonb(data.value), true
from site
cross join (values
  ('company_name', 'Náutica Color'),
  ('location', 'Marina Verolme, Angra dos Reis - RJ'),
  ('phone', '(24) 2404-4606'),
  ('whatsapp_visible', '(24) 99844-7844'),
  ('whatsapp_number', '5524998447844'),
  ('instagram', '@nauticacolor'),
  ('positioning', 'Mais do que pintura, é sobre preservar valor, estética e prestígio.'),
  ('price_notice', 'Valores demonstrativos sujeitos à confirmação.')
) as data(key, value)
on conflict (site_id, key) do update set value = excluded.value, is_public = excluded.is_public;

with site as (
  select id from public.store_sites where slug = 'nautica-color'
),
product_data as (
  select * from (values
    ('JOT-SFA-36', 'jotun', 'antifouling', 'jotun-seaforce-active-3-6-l', 'Jotun SeaForce Active 3,6 L', 'Revestimento anti-incrustante para proteção do casco.', 95000, 'Galão 3,6 L', '/products/placeholders/galao.svg', true),
    ('NOR-T277', 'norton', 'lixas-e-abrasivos', 'folha-de-lixa-dagua-t277', 'Folha de Lixa dÁgua T277', 'Lixa para trabalhos úmidos em superfícies, primers e compostos.', 290, 'Unidade', '/products/placeholders/folha-lixa.svg', true),
    ('NOR-A275-127', 'norton', 'lixas-e-abrasivos', 'disco-de-lixa-a275-127-mm', 'Disco de Lixa A275 127 mm', 'Disco abrasivo para preparação e acabamento de superfícies.', 161, 'Unidade', '/products/placeholders/disco-lixa.svg', false),
    ('NOR-LIQUID-ICE-1', 'norton', 'limpeza-protecao-e-polimento', 'massa-de-polir-liquid-ice-ultra-1-kg', 'Massa de Polir Liquid Ice Ultra 1 kg', 'Massa para corte e remoção de pequenas imperfeições.', 7307, 'Embalagem 1 kg', '/products/placeholders/lata.svg', true),
    ('NOR-BOINA-8', 'norton', 'limpeza-protecao-e-polimento', 'boina-de-espuma-dupla-face-8-polegadas', 'Boina de Espuma Dupla Face 8 polegadas', 'Boina de espuma para acabamento e polimento.', 11418, 'Unidade', '/products/placeholders/boina.svg', false),
    ('NOR-MASSA-BASE-AGUA', 'norton', 'limpeza-protecao-e-polimento', 'massa-de-polir-base-dagua-1-kg', 'Massa de Polir Base dÁgua 1 kg', 'Massa de polir à base dágua para acabamento de superfícies.', 3417, 'Embalagem 1 kg', '/products/placeholders/lata.svg', false),
    ('NOR-SPRAY-946', 'norton', 'limpeza-protecao-e-polimento', 'spray-de-acabamento-liquid-ice-946-ml', 'Spray de Acabamento Liquid Ice 946 ml', 'Spray para limpeza e acabamento após o polimento.', 12000, 'Frasco 946 ml', '/products/placeholders/frasco.svg', false),
    ('SIK-AUTOCLEAR-1', 'sikkens', 'vernizes-e-acabamentos', 'autoclear-plus-hs-1-l', 'Autoclear Plus HS 1 L', 'Verniz de alta performance para acabamento e brilho.', 10700, 'Lata 1 L', '/products/placeholders/lata.svg', true),
    ('SIK-REDUCER-1', 'sikkens', 'vernizes-e-acabamentos', 'plus-reducer-medium-1-l', 'Plus Reducer Medium 1 L', 'Diluente universal para diferentes aplicações.', 6600, 'Lata 1 L', '/products/placeholders/frasco.svg', false),
    ('SIK-AUTOCLEAR-5', 'sikkens', 'vernizes-e-acabamentos', 'autoclear-plus-hs-5-l', 'Autoclear Plus HS 5 L', 'Verniz de alta performance em embalagem profissional.', 45900, 'Galão 5 L', '/products/placeholders/galao.svg', false),
    ('WAN-PRIMER-5100', 'wanda', 'tintas-de-fundo-e-primers', 'primer-pu-5100-com-catalisador', 'Primer PU 5100 com Catalisador', 'Primer de enchimento para preparação de superfícies.', 5200, 'Kit 900 ml', '/products/placeholders/lata.svg', true),
    ('WAN-VERNIZ-5100', 'wanda', 'vernizes-e-acabamentos', 'verniz-pu-5100-com-catalisador', 'Verniz PU 5100 com Catalisador', 'Verniz de secagem rápida e acabamento de alto brilho.', 5890, 'Kit 900 ml', '/products/placeholders/lata.svg', true),
    ('COL-GELCOAT-BRANCO', 'colorgel-marine', 'fiberglass-e-compositos', 'colorgel-marine-gelcoat-branco', 'Colorgel Marine Gelcoat Branco', 'Gelcoat demonstrativo para acabamento de peças náuticas.', 7590, 'Embalagem 1 kg', '/products/placeholders/lata.svg', true),
    ('COL-RESINA-5', 'colorgel-marine', 'fiberglass-e-compositos', 'resina-poliester-para-laminacao', 'Resina Poliéster para Laminação', 'Resina demonstrativa para trabalhos de laminação e fibra.', 15493, 'Kit 5 kg', '/products/placeholders/galao.svg', false),
    ('COL-TECIDO-190', 'colorgel-marine', 'fiberglass-e-compositos', 'tecido-de-fibra-de-vidro-190-g', 'Tecido de Fibra de Vidro 190 g', 'Tecido de fibra de vidro para reforço e reparos.', 2000, 'Metro', '/products/placeholders/fibra.svg', false),
    ('COL-PRIMER-BRANCO', 'colorgel-marine', 'tintas-de-fundo-e-primers', 'gelcoat-primer-branco', 'Gelcoat Primer Branco', 'Primer demonstrativo para preparação de peças em fibra.', 5000, 'Kit 1 kg', '/products/placeholders/lata.svg', false)
  ) as p(sku, brand_slug, category_slug, slug, name, short_description, price_cents, unit, image_url, featured)
)
insert into public.store_products (
  site_id, brand_id, category_id, sku, slug, name, short_description, description, price_cents,
  unit, image_url, active, featured, demo_price, stock_status, tags
)
select
  site.id,
  brand.id,
  category.id,
  p.sku,
  p.slug,
  p.name,
  p.short_description,
  p.short_description || ' Produto demonstrativo do catálogo Náutica Color. Confirme disponibilidade, especificações e aplicação correta com nossa equipe.',
  p.price_cents,
  p.unit,
  p.image_url,
  true,
  p.featured,
  true,
  'on_request',
  array[brand.name, category.name]
from product_data p
join site on true
join public.store_brands brand on brand.site_id = site.id and brand.slug = p.brand_slug
join public.store_categories category on category.site_id = site.id and category.slug = p.category_slug
on conflict (site_id, sku) do update set
  brand_id = excluded.brand_id,
  category_id = excluded.category_id,
  slug = excluded.slug,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price_cents = excluded.price_cents,
  unit = excluded.unit,
  image_url = excluded.image_url,
  active = excluded.active,
  featured = excluded.featured,
  demo_price = excluded.demo_price,
  stock_status = excluded.stock_status,
  tags = excluded.tags;
