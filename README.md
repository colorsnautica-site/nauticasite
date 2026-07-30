# Náutica Color — site + painel admin

Site institucional e catálogo de produtos da Náutica Color, com painel administrativo
para gerenciar produtos, marcas e conteúdo do site. Next.js 15 (App Router) + React 19 +
TypeScript + Tailwind CSS + Drizzle ORM (Postgres/Neon).

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha os valores reais (peça a alguém do time)
npm run dev                  # http://localhost:3000
```

Variáveis de ambiente necessárias (`.env.local`, nunca commitado — veja `.env.example`):

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão Postgres (produção/dev) |
| `TEST_DATABASE_URL` | Banco descartável só para `npm run test:e2e` — **nunca** igual a `DATABASE_URL` |
| `SESSION_SECRET` | Assinatura do JWT de sessão do admin (mín. 32 caracteres) |
| `ADMIN_PASSWORD` | Senha de login do painel admin |
| `BLOB_READ_WRITE_TOKEN` | Upload de imagens (Vercel Blob) |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Next.js padrão |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Testes unitários (Vitest, exclui integração) |
| `npm run test:integration` | Testes que tocam banco real (`vitest.integration.config.ts`) |
| `npm run test:e2e` | Playwright, contra `TEST_DATABASE_URL` — ver `tests/e2e/global-setup.ts` |
| `npm run db:generate` / `db:migrate` | Drizzle Kit |
| `npm run db:seed` / `db:audit` | Scripts avulsos (`scripts/`) |

## Estrutura de pastas

```
src/
  app/                    Rotas (App Router)
    admin/                Painel administrativo
      (painel)/           Rotas autenticadas do painel (layout, nav, forms)
        _components/      Componentes só do painel (modais de produto/marca, forms)
      actions/             Server Actions de auth (login/logout)
      login/               Rota de login (pública)
    produtos/              Catálogo público
    @modal/                Slot paralelo do Next.js: modal de detalhe de produto
                            quando navegado via link interno (intercepting route)

  components/             Componentes React reutilizáveis
    ui/                    Genéricos (Modal.tsx: dialog animado usado em todo o site)
    cart/                  Carrinho (contexto, botão, modal)
    products/              Cards, grid, busca, modal de detalhe

  hooks/                  Hooks compartilhados (ex: useDialogBehavior — foco/ESC/scroll-lock)

  lib/                    Lógica de domínio, sem JSX
    auth/                  Sessão (JWT), senha do admin, rate-limit de login
    cart.ts                Regras puras do carrinho (somar, montar mensagem de WhatsApp)
    currency.ts             Formatação de preço para EXIBIÇÃO (site)
    money.ts                Conversão de preço para FORMULÁRIOS (painel admin)
    admin-validation.ts     Schemas Zod dos formulários do admin
    blob.ts                 Upload/remoção de imagem (Vercel Blob)

  db/                     Camada de banco (Drizzle)
    schema.ts               Definição das tabelas
    queries/                 Leituras
    mutations.ts             Escritas usadas pelas Server Actions
    changelog.ts / undo.ts   Histórico de alterações do painel + desfazer

  data/                   Dados estáticos/gerados (catálogo de produtos, conteúdo do site)

scripts/                  Scripts avulsos, não fazem parte do build
  extract-products.mjs     Reimporta o catálogo a partir dos PDFs de origem (roda manual)
  seed.ts / audit-db.ts    Seed e auditoria do banco

tests/e2e/                Testes Playwright (ponta a ponta, banco descartável)
docs/superpowers/         Specs e planos de features (brainstorming → plano → implementação)
```

## Convenções

- **Server Actions** ficam em `actions.ts` colocado com a rota que as usa
  (`app/admin/(painel)/<rota>/actions.ts`), exceto autenticação, que é compartilhada
  entre rotas (`app/admin/actions/auth.ts`).
- **Modais**: use o `Modal.tsx` (`components/ui/Modal.tsx`) para qualquer diálogo do
  site público — já traz animação de entrada/saída, focus-trap, ESC e scroll-lock.
  Os formulários largos do painel admin (`_components/ProductRow.tsx`,
  `CreateProductForm.tsx`) têm layout próprio (não cabem no `max-w-lg` do `Modal.tsx`),
  mas reaproveitam o comportamento comum via `hooks/useDialogBehavior.ts` — se precisar
  de outro modal customizado, comece por esse hook em vez de duplicar a lógica de
  foco/ESC/scroll na mão.
- **Exports mínimos**: só exporte de um módulo de `lib/` o que outro arquivo realmente
  importa. Funções/constantes usadas só internamente ficam sem `export`.
- Antes de adicionar uma dependência nova ou remover uma "não usada", rode
  `npx knip` e `npx depcheck` — mas confira manualmente antes de agir: ambos têm
  falsos-positivos conhecidos neste projeto (`sharp` é usado implicitamente pelo
  Next.js Image Optimization; `pdf-parse` só é usado por `scripts/extract-products.mjs`).

## Testes

- **Unitários** (`*.test.ts` colocado com o arquivo testado): lógica pura, sem banco.
- **Integração** (`*.integration.test.ts`): tocam banco real via `TEST_DATABASE_URL`.
- **E2E** (`tests/e2e/*.e2e.spec.ts`): fluxo completo no navegador. `playwright.config.ts`
  troca `DATABASE_URL` por `TEST_DATABASE_URL` durante a execução — nunca aponte
  `TEST_DATABASE_URL` para o banco de produção.

## Fluxo de trabalho

Features maiores seguem brainstorming → spec → plano → implementação, documentados em
`docs/superpowers/`. PRs ficam como **draft** até o time confirmar que estão prontos
para revisão.
