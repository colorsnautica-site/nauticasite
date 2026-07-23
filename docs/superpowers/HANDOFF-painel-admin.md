# HANDOFF — Painel de Admin da Náutica Color

**Criado:** 2026-07-23 · **Para retomar em:** 2026-07-24
**Status:** Planejamento **concluído e aprovado**. Pronto para implementar. Nada de código do painel foi escrito ainda.

---

## TL;DR (o que fazer amanhã)

1. **Dono:** fazer a **Task 0.1** do plano — na Vercel, criar o banco Postgres, ligar o Blob e definir os segredos `ADMIN_PASSWORD` e `SESSION_SECRET` (passo a passo no plano). **Isto desbloqueia tudo.**
2. **Claude:** rodar `vercel env pull .env.local`, depois começar a implementar pela **Fase 0** do plano, task por task.
3. **Decisão pendente:** escolher o modo de execução — **subagentes** (recomendado) ou **inline**. (O dono ainda não respondeu.)

---

## Onde estão os documentos

- **Especificação (o quê/porquê):** `docs/superpowers/specs/2026-07-23-painel-admin-design.md`
- **Plano de implementação (passo a passo, com código):** `docs/superpowers/plans/2026-07-23-painel-admin.md`
- **Este handoff:** `docs/superpowers/HANDOFF-painel-admin.md`

Cópias duráveis dos três arquivos foram colocadas no checkout principal do dono:
`C:\Users\drive\Documents\Nautica\docs\superpowers\` (independente do worktree).

## Estado do Git

- **Worktree:** `C:\Users\drive\Documents\Nautica\.claude\worktrees\hero-testimonial-fix`
- **Branch:** `worktree-hero-testimonial-fix`
- **Commits locais (NÃO empurrados para o GitHub):**
  - `21b930c` docs(admin): especificacao do painel de admin
  - `8f7402f` docs(admin): plano de implementacao do painel
  - (+ o commit deste handoff)
- **PR #4** (draft) contém os ajustes visuais de hero/cards já empurrados; os docs de planejamento **não** foram empurrados de propósito, para não misturar assuntos.
- Ainda **pendente de validação no preview (porta 3001)** e de merge: os ajustes de hero/cards do PR #4.

---

## Decisões travadas (não reabrir sem motivo)

| Tópico | Decisão |
|---|---|
| Hospedagem | **Vercel** |
| Fundação de dados | **Abordagem A:** Postgres (Vercel/Neon) + Vercel Blob para fotos. Edição instantânea. |
| ORM/driver | Drizzle ORM + `postgres` (postgres-js) |
| Escopo | **Completo:** produtos (nome, foto, preço, disponibilidade, marca, add/remover, mover categoria) + hero + contato + marcas |
| Login | **Só o dono, uma senha** (env `ADMIN_PASSWORD`; sessão JWT via `jose`) |
| Histórico | **Sim** — `change_log` com snapshots + desfazer |
| Preço | `priceCents` (int). `>0` → "R$ X,XX"; `<=0` → "Sob consulta" |
| Categorias | **Fixas no código** (não editáveis) — sem tabela no banco |
| `products.id` | Gerado pelo banco (serial); código do ERP fica em `sku` |

---

## Único bloqueio para começar: Task 0.1 (ação do dono)

No dashboard da Vercel, projeto `nauticasite`:
1. **Storage → Create Database → Postgres (Neon)** → conectar ao projeto (injeta `DATABASE_URL`; usar a *pooled connection string*).
2. **Storage → Create → Blob** → conectar (injeta `BLOB_READ_WRITE_TOKEN`).
3. **Settings → Environment Variables** (Production + Preview + Development):
   - `ADMIN_PASSWORD` = senha do painel
   - `SESSION_SECRET` = string aleatória longa (ex.: `openssl rand -base64 48`)
4. Localmente: `npm i -g vercel` (se preciso) → `vercel link` → `vercel env pull .env.local`.

**Pronto quando:** `.env.local` tem `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

> Enquanto a Task 0.1 não estiver feita, dá para adiantar só as **libs de lógica pura** (Fase 2 Task 2.1 dinheiro, Fase 2 Task 2.2 auth, Fase 1 Task 1.1 mapper, Fase 3 Task 3.2 `computeUndo`) — todas têm testes com Vitest e não dependem do banco. Migração, semente e build precisam da `DATABASE_URL`.

---

## Ordem de execução (do plano)

- **Fase 0** — Fundação: deps + schema Drizzle + migração + **semente dos 1.504 produtos** (+ conteúdo + marcas).
- **Fase 1** — Site público passa a ler produtos do banco (sem mudança visual).
- **Fase 2** — Login por senha + middleware + esqueleto do `/admin`.
- **Fase 3** — **Produtos** (pedido principal): lista com busca/filtro/paginação, editar campos, upload de foto, add/remover, mover categoria.
- **Fase 4** — Conteúdo do site (hero + contato) + marcas parceiras.
- **Fase 5** — Histórico + desfazer.

Cada fase é publicável de forma independente. Verificar sempre com `npm test`, `npm run typecheck`, `npm run build`, e o fluxo manual descrito no fim do plano.

---

## Checklist de retomada (amanhã)

- [ ] Dono concluiu a **Task 0.1** (banco + Blob + segredos).
- [ ] `vercel env pull .env.local` rodado; variáveis presentes.
- [ ] Modo de execução escolhido (subagentes ou inline).
- [ ] Confirmar se os ajustes do PR #4 (hero/cards) foram validados no preview e devem ser mesclados antes de começar o painel (ou seguir em paralelo).
- [ ] Iniciar a Fase 0, Task 0.2 (instalar deps).

---

## Contexto extra útil

- Site é Next.js 15 estático; produtos hoje em `src/data/products/*.ts` (7 arquivos, ~1.504 itens), conteúdo/marcas em `src/data/store.ts`.
- Preview de desenvolvimento do dono roda em `http://127.0.0.1:3001` (checkout principal `C:\Users\drive\Documents\Nautica`, branch `main`).
- Regra do dono para esta fase de trabalho: **alterar localmente e só subir depois de validar no preview** — vale para mudanças que afetam o site; os docs de planejamento foram mantidos locais por isso.
