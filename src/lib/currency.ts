// Formatação de preço para EXIBIÇÃO no site (cliente): carrinho, cards, detalhe de produto.
// Para converter preço em campos de FORMULÁRIO do painel admin, veja src/lib/money.ts.
function centsToReais(cents: number) {
  return cents / 100;
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(centsToReais(cents));
}

// priceCents <= 0 sinaliza produto sem preço de referência ("sob consulta").
export function isOnRequestPrice(cents: number) {
  return !cents || cents <= 0;
}

export function formatPriceLabel(cents: number) {
  return isOnRequestPrice(cents) ? "Sob consulta" : formatCurrency(cents);
}
