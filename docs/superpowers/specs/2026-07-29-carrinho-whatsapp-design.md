# Carrinho de compras com finalização via WhatsApp

## Contexto

O site da Náutica Color hoje é deliberadamente sem carrinho: cada card de produto tem um único botão "Falar no WhatsApp" que abre uma conversa já preenchida com nome, código e preço de referência daquele item (`src/components/products/ProductCard.tsx`, `src/lib/whatsapp.ts`). Não existe página de detalhe de produto — o comentário no topo de `ProductCard.tsx` documenta essa decisão explicitamente.

O dono pediu para reverter essa decisão: o cliente deve poder escolher vários produtos, revisar quantidades, e finalizar tudo numa única mensagem de WhatsApp — e, junto disso, ganhar uma página/modal de detalhe por produto (hoje inexistente).

## Objetivo

1. Cliente adiciona produtos a um carrinho enquanto navega pelo catálogo.
2. Cliente revisa o carrinho (itens, quantidades, remover) num modal.
3. Cliente finaliza: abre o WhatsApp com uma mensagem já formatada listando todos os itens do carrinho, para o número de atendimento configurado no painel admin.
4. Cliente também pode clicar em um produto para ver seus detalhes numa página/modal própria (novo — hoje não existe).

## Decisões (confirmadas com o dono)

- O botão "Adicionar ao carrinho" **substitui** o botão individual "Falar no WhatsApp" em cada card — finalizar sempre passa pelo carrinho, mesmo para 1 item.
- O carrinho **persiste entre visitas** (sobrevive a F5 e a fechar/reabrir o navegador).
- O carrinho suporta **quantidade por item** (contador +/-, não é só presença/ausência).
- Revisão do carrinho acontece num **modal** (ícone flutuante com contador → modal), no mesmo estilo visual do modal de produto do painel admin.
- Depois de finalizar no WhatsApp, o carrinho **continua guardado** até o cliente esvaziar manualmente.
- O detalhe de produto usa uma **rota própria por SKU** (`/produtos/[categoria]/[sku]`), interceptada como modal ao navegar dentro do site (Next.js *intercepting routes*), mas funcionando como página cheia se acessada direto ou compartilhada.
- SKU é o identificador da URL (confirmado: os 1504 produtos atuais têm SKU único e não-vazio). Fallback defensivo: se um produto futuro for cadastrado sem SKU, a URL usa o `id` numérico no lugar.

## Fora de escopo

- Checkout/pagamento real — a "finalização" é só abrir o WhatsApp com a mensagem pronta; a negociação final continua manual pelo atendimento, como já é hoje.
- Sincronizar carrinho entre dispositivos/contas — não existe conta de cliente no site.
- Alterar o painel de admin ou o banco de dados — nenhuma tabela nova, nenhuma mudança de schema.
- Refatorar o modal duplicado que já existe no painel admin (`CreateProductForm.tsx` / `ProductRow.tsx`) — é um problema documentado separadamente na auditoria de 2026-07-29; esta feature cria seu **próprio** componente `<Modal>` para o site público, sem tocar no código do admin.

## Arquitetura

Duas partes com necessidades diferentes, resolvidas de formas diferentes:

- **Modal de produto** → precisa de URL própria (compartilhável, indexável, funciona com o botão voltar do navegador) → *intercepting route* do Next.js App Router.
- **Carrinho** → é uma sacola temporária, não é conteúdo navegável/compartilhável → Context do React + `localStorage`, sem rota própria.

Ambos usam o mesmo componente visual `<Modal>` (novo, compartilhado), para consistência de estilo com o modal já existente no painel admin — sem duplicar a implementação de foco/scroll-lock/Escape como acontece hoje entre `CreateProductForm.tsx` e `ProductRow.tsx`.

### Estrutura de rotas (produto)

```
src/app/
  layout.tsx                                   # passa a renderizar o slot {modal}
  @modal/
    default.tsx                                # retorna null (sem modal por padrão)
    (...)produtos/[categoria]/[sku]/
      page.tsx                                 # versão interceptada (dentro do <Modal>)
  produtos/
    [categoria]/
      page.tsx                                 # listagem (já existe)
      [sku]/
        page.tsx                               # página cheia (fallback / link direto / SEO)
```

`(...)` intercepta a partir da raiz do app, então funciona tanto navegando da home (`/`, seção "produtos em destaque") quanto de dentro de `/produtos/[categoria]`.

### Componentes novos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/cart.ts` | Tipos (`CartItem`, `CartState`) e funções puras: adicionar, remover, mudar quantidade, zerar, `buildCartMessage(items)`. Sem React — testável isoladamente. |
| `src/components/cart/CartContext.tsx` | `"use client"`. `CartProvider` (estado + sincronização com `localStorage`) e hook `useCart()`. |
| `src/components/cart/CartButton.tsx` | Ícone flutuante com contador de itens; abre/fecha o `CartModal`. |
| `src/components/cart/CartModal.tsx` | Lista de itens (imagem, nome, preço, quantidade, remover), total, "Finalizar no WhatsApp", "Esvaziar carrinho". |
| `src/components/ui/Modal.tsx` | Casca visual compartilhada: overlay, fecha com X/Esc/clique fora, trava scroll do body, foco preso dentro do modal. |
| `src/components/products/ProductDetailView.tsx` | Conteúdo do produto: imagem grande, nome, marca, preço, status de disponibilidade, seletor de quantidade, botão "Adicionar ao carrinho". Reaproveitado pela página cheia e pela versão interceptada. |

### Componentes alterados

- **`src/components/products/ProductCard.tsx`** — o botão "Falar no WhatsApp" vira "Adicionar ao carrinho" (adiciona 1 unidade direto, sem navegar). O restante do card (imagem/título) vira um link para `/produtos/[categoria]/[sku]`, abrindo o modal de detalhe.
- **`src/app/layout.tsx`** — recebe e renderiza a prop `modal` (slot paralelo `@modal`), e monta o `<CartProvider>` envolvendo o site inteiro (carrinho precisa estar disponível na home e em `/produtos`).
- **`src/db/queries/products.ts`** — novo `getProductBySku(categorySlug, sku)` (ou por `id` no fallback), seguindo o padrão de cache/tag já usado pelas outras queries.
- **`src/lib/whatsapp.ts`** — ganha `buildCartMessage(items)`, no mesmo tom e formato de `buildProductMessage` (lista com nome, código, preço de referência de cada item, e o aviso de que os valores são apenas referência).

## Fluxo de dados

Cada item do carrinho guarda uma **cópia dos dados do produto no momento em que foi adicionado** (nome, SKU, marca, `priceCents`, categoria, imagem) — não um ID que precisa ser rebuscado depois. Isso:

- Combina com o texto que já existe hoje ("Os valores do site são apenas referência").
- Evita quebrar o carrinho se o produto for editado ou apagado no admin depois de já estar na sacola do cliente.
- Mantém a mesma filosofia de `buildProductMessage`, que já monta a mensagem só com os dados do produto, sem consultar o banco de novo.

`CartProvider` inicializa o estado vazio no primeiro render (evita divergência servidor/cliente) e só lê o `localStorage` de verdade dentro de um `useEffect`, depois do site já estar montado no navegador.

## Tratamento de erros

- **`localStorage` indisponível** (navegação privada em alguns navegadores, ou bloqueado): leitura/escrita protegidas por `try/catch`; o carrinho simplesmente não persiste nesse caso, sem quebrar a página.
- **SKU inválido ou inexistente na URL**: tanto a página cheia quanto a versão interceptada chamam `notFound()`, reaproveitando o padrão visual que já existe em `src/app/produtos/not-found.tsx`.
- **Produto sem SKU** (hoje não acontece, mas o campo é opcional no admin): fallback para `id` numérico na URL.
- **Carrinho com item cujo preço é "Sob consulta"**: não entra na soma numérica do total exibido no modal; a mensagem de WhatsApp já deixa claro que preços são referência.

## Testes

- **Unitários (Vitest)**, seguindo o padrão já usado no projeto (`src/lib/*.test.ts`):
  - `cart.test.ts` — adicionar, incrementar/decrementar quantidade, remover, zerar; `buildCartMessage()` com 1 item, vários itens, e mistura de preço definido/"Sob consulta".
- **E2E (Playwright)**, novo `tests/e2e/carrinho.e2e.spec.ts`:
  - Adicionar produto pelo card → ícone do carrinho mostra contador 1.
  - Abrir modal de produto (clicar no card) → botão "Adicionar ao carrinho" funciona de dentro do modal também.
  - Abrir carrinho → ajustar quantidade → remover item → esvaziar.
  - Clicar "Finalizar no WhatsApp" → URL gerada (`wa.me/...`) contém os nomes/códigos dos produtos do carrinho.

## Perguntas em aberto

Nenhuma — todas as decisões de produto foram confirmadas com o dono antes de escrever esta spec.
