# Migração do catálogo para o Supabase

Carrega os 1.936 produtos (e marcas/categorias/configurações) do `catalog-seed.json`
para o seu projeto Supabase. Enquanto o Supabase não estiver configurado, o site usa
o fallback em `src/lib/catalog/demo-data.ts` (mesmos dados), então **nada quebra** se
você ainda não rodar este passo.

## Passo 1 — Criar as tabelas

No painel do Supabase → **SQL Editor**, cole e rode (nesta ordem) o conteúdo de:

```
supabase/migrations/001_nautica_catalog.sql
supabase/migrations/002_brand_optional.sql
```

(ou, com a CLI do Supabase: `supabase db push`)

A `001` cria as tabelas `store_sites`, `store_brands`, `store_categories`,
`store_products`, `store_settings` (PK `uuid`), os triggers de `updated_at` e
libera **leitura pública** (RLS) apenas dos registros ativos/públicos. A própria
migration já insere o site e um catálogo de exemplo (16 produtos) — o seed do
Passo 2 substitui isso pelos 1.936 produtos reais (upsert por `sku`).
A `002` torna `brand_id` opcional (produtos sem marca oficial ficam com
`brand_id` nulo).

## Passo 2 — Popular os dados

Pegue em **Project Settings → API**:

- `Project URL` → `SUPABASE_URL`
- `service_role` key (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

Rode (PowerShell):

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
node scripts/seed/seed-supabase.mjs
```

> A `service_role` key ignora o RLS. Use só localmente; **nunca** a coloque no
> front-end nem commite num arquivo.

## Passo 3 — Apontar o site para o Supabase

No `.env.local` do projeto (chaves **públicas**, não a service role):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ... (anon/publishable key)
NEXT_PUBLIC_SITE_SLUG=nautica-color
```

Com essas variáveis presentes, `get-catalog` passa a ler do Supabase
automaticamente (e cai no demo só se a consulta falhar).

## Reimportar quando o PDF mudar

O `catalog-seed.json` e o `demo-data.ts` são **gerados** a partir do relatório
"Vendas por Mark-Up". Quando houver um relatório novo, regenere os dois e rode o
seed de novo (o upsert atualiza por `id`, sem duplicar).
