# Especificação — Painel de Admin da Náutica Color

**Data:** 2026-07-23
**Status:** Aprovado pelo dono (desenho). Pendente: revisão do documento antes do plano de implementação.

## Contexto

O site da Náutica Color (`colorsnautica-site/nauticasite`) é hoje um app **Next.js 15
estático**, publicado na **Vercel**. Não há banco de dados nem backend:

- **Produtos** (~1.504, em 7 categorias) vivem em arquivos de código
  `src/data/products/<slug>.ts`, gerados a partir de PDFs do ERP. Todos hoje com
  `priceCents: 0` ("Sob consulta") e `imageUrl` apontando para placeholders.
- **Textos e dados da loja** (hero, contato, Instagram) em `src/data/store.ts`.
- **Marcas parceiras** (logos) também em `src/data/store.ts` (`partnerBrands`).
- **Imagens** em `public/` (`hero/`, `products/`, `brand/`).

Mudar qualquer coisa hoje exige editar código e republicar. O dono quer um **painel
de admin** que permita editar, **em tempo real e sem mexer em código**: o nome, a
foto e o preço de **cada produto**, além dos textos/fotos do site.

## Decisões (confirmadas com o dono)

| Tópico | Decisão |
|---|---|
| **Hospedagem** | Vercel (confirmado). |
| **Fundação de dados** | **Abordagem A:** banco de dados + armazenamento de imagens, nativos da Vercel. Edição instantânea. |
| **Escopo de edição** | **Completo:** produtos (nome, foto, preço, disponibilidade, marca, adicionar/remover, mover de categoria) + hero + contato + marcas parceiras. |
| **Login** | **Só o dono, uma senha.** Sem cadastro de múltiplos usuários (por ora). |
| **Histórico** | **Sim** — guardar histórico das alterações e permitir **desfazer**. |
| **Preço** | Mantém `priceCents`. `> 0` → "R$ X,XX"; `0`/vazio → "Sob consulta". |

## Arquitetura

### Peças novas (todas Vercel, plano grátis nesse porte)

- **Banco de dados:** Postgres provisionado via **Vercel Marketplace** (ex.: Neon).
  Acesso type-safe com **Drizzle ORM** + migrações versionadas.
- **Armazenamento de imagens:** **Vercel Blob** (público) para fotos de produtos,
  imagem do hero e logos de marcas.
- **App:** o mesmo projeto Next.js. Painel em `/admin`. Mutações via **Server Actions**.
- **Autenticação:** senha única em variável de ambiente (`ADMIN_PASSWORD`), nunca no
  código. Ao logar, gera **sessão via cookie assinado** (JWT com `SESSION_SECRET`,
  `httpOnly`, expira). **Middleware** protege `/admin/*` e todas as ações de escrita.

### Variáveis de ambiente (Vercel)

- `DATABASE_URL` — conexão Postgres.
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (injetado pela Vercel ao ligar o Blob).
- `ADMIN_PASSWORD` — senha do painel.
- `SESSION_SECRET` — chave para assinar o cookie de sessão.

## Modelo de dados (tabelas)

1. **`categories`** — `slug` (pk), `name`, `sort_order`. Semente: as 7 categorias atuais.
2. **`products`** — `id` (pk), `sku`, `name`, `category_slug` (fk), `brand_name`,
   `price_cents` (int, default 0), `unit`, `stock_status` (`available` | `on_request`),
   `image_url`, `sort_order`, `created_at`, `updated_at`. Semente: os 1.504 produtos.
3. **`site_content`** — configuração chave→valor (ou uma linha de settings) para o
   **hero** (`hero_image`, `hero_title`, `hero_description`) e **contato**
   (`phone`, `whatsapp_1`, `whatsapp_2`, `location`, `instagram`, `company_name`).
4. **`partner_brands`** — `id` (pk), `name`, `logo_url`, `sort_order`.
5. **`change_log`** (histórico/desfazer) — `id` (pk), `entity_type`
   (`product` | `site_content` | `partner_brand`), `entity_id`, `snapshot_before`
   (JSON do registro antes da mudança), `snapshot_after` (JSON depois), `action`
   (`update` | `create` | `delete`), `changed_at`. **Desfazer** = reaplicar
   `snapshot_before` (ou recriar/remover conforme a ação).

## Camada pública (como o site passa a ler os dados)

- As páginas (`src/app/page.tsx`, `src/app/produtos/**`) passam a ler do banco via
  uma **camada de dados** (`src/db/queries/*`) em vez de importar os arquivos TS.
- Uso de **cache** (`unstable_cache` + tags) para manter o site rápido; ao salvar no
  painel, a Server Action chama `revalidateTag`/`revalidatePath` → a página pública
  reflete a mudança **na hora**.
- Os arquivos `src/data/products/*.ts` e `src/data/store.ts` deixam de ser a fonte
  em produção; ficam como **semente/backup** da migração inicial (podem ser removidos
  depois, opcional).

## Painel de admin — telas e componentes (`src/app/admin/`)

- **`/admin/login`** — formulário de senha. Erro amigável se a senha estiver errada.
- **`/admin`** (início) — atalhos: Produtos, Conteúdo do site, Marcas, Histórico. Sair.
- **`/admin/produtos`** — lista com **busca** (nome/sku), **filtro por categoria** e
  **paginação** (reaproveita a lógica de `paginate`/`Pagination` já existente). Cada
  item permite editar **nome, preço (em reais), disponibilidade, marca, categoria**,
  **upload/troca de foto** e **remover**. Botão **"Adicionar produto"** (formulário
  com os mesmos campos; `sku`/`id` gerados ou informados).
- **`/admin/conteudo`** — formulário do **hero** (upload da imagem de fundo, título,
  descrição) e do **contato** (telefones, WhatsApp x2, endereço, Instagram, nome).
- **`/admin/marcas`** — lista de logos com **upload**, **adicionar**, **remover** e
  **reordenar**.
- **`/admin/historico`** — lista de alterações (o quê, quando, valor anterior → novo),
  com botão **"Desfazer"** por item.

### Componentes de apoio

- `src/db/schema.ts` (Drizzle), `src/db/client.ts`, `src/db/queries/{products,content,brands,changelog}.ts`.
- `src/lib/auth.ts` — assinar/verificar sessão, checar senha.
- `src/lib/blob.ts` — helper de upload (valida tipo de imagem + limite de tamanho).
- `src/lib/money.ts` — formatação reais ↔ `priceCents` (reaproveita `formatPriceLabel`).
- `src/app/admin/_components/*` — formulários, uploader de imagem, tabela de produtos.

## Fluxos-chave

- **Editar produto:** admin altera campo → Server Action valida → grava no banco +
  registra `change_log` (snapshot antes/depois) → `revalidateTag('products')` → site
  atualizado.
- **Upload de foto:** admin seleciona/arrasta imagem → sobe pro Vercel Blob → URL
  salva no registro. (Opcional: manter o arquivo antigo no Blob por segurança.)
- **Desfazer:** admin abre Histórico → "Desfazer" → reaplica `snapshot_before` e
  registra a reversão como nova entrada do log.

## Migração inicial (script único, uma vez)

Script (`scripts/seed-db.mjs` ou task Drizzle) que lê `src/data/products/*.ts`,
`src/data/store.ts` (`store` + `partnerBrands`) e **insere tudo no banco**, conferindo
que a contagem de produtos bate **1.504**. Idempotente/reexecutável em ambiente novo.

## Segurança

- Senha **nunca** no código (env var na Vercel).
- Cookie de sessão **assinado, `httpOnly`, com expiração**.
- **Todas** as rotas `/admin/*` e Server Actions de escrita exigem sessão válida
  (checagem no middleware + reforço na própria action).
- Upload aceita **apenas imagens** (mime allow-list) com **limite de tamanho**.
- Sem dados sensíveis em query string; nomes de arquivo do Blob saneados.

## Faseamento sugerido (para o plano de implementação)

1. **Fase 0 — Fundação:** provisionar Postgres + Blob na Vercel; Drizzle + schema +
   migrações; script de migração inicial (semente dos 1.504 produtos + conteúdo/marcas).
2. **Fase 1 — Site lê do banco:** trocar as páginas públicas para a camada de dados +
   cache/revalidação. (Sem mudança visual; só a fonte dos dados.)
3. **Fase 2 — Login + esqueleto do admin:** auth por senha, middleware, `/admin`
   layout e início.
4. **Fase 3 — Produtos:** lista com busca/filtro/paginação, editar campos, upload de
   foto, adicionar/remover, mover de categoria. **(Entrega o pedido principal.)**
5. **Fase 4 — Conteúdo do site + marcas:** hero, contato, marcas parceiras.
6. **Fase 5 — Histórico/desfazer:** tela de histórico e ação de reverter.

Cada fase é publicável de forma independente na Vercel.

## Verificação

1. `npm run typecheck` — sem erros de tipo.
2. `npm run build` — build passa.
3. Migração: contagem de produtos no banco == **1.504** (soma das 7 categorias).
4. Teste manual do fluxo: login → editar preço e foto de um produto → conferir no
   site (atualização imediata) → desfazer no histórico → editar hero/contato/marca.
5. Segurança: acessar `/admin` sem login redireciona para `/admin/login`; ações de
   escrita sem sessão são rejeitadas.

## Fora de escopo (por ora)

- Múltiplos usuários / permissões (só o dono, uma senha).
- Login com Google/OAuth.
- Carrinho/checkout (o funil continua sendo o WhatsApp).
- Importação automática de novos PDFs do ERP (cadastro é manual pelo painel).
