-- Produtos podem não ter marca: o catálogo só reconhece as marcas oficiais
-- (com logo). Itens de outros fabricantes ficam sem marca (brand_id nulo).
alter table public.store_products
  alter column brand_id drop not null;
