// Converte texto digitado (reais) para centavos. "" → 0. Inválido → null.
//
// Trata "," e "." como possíveis separadores decimais ou de milhar. O último
// separador (vírgula ou ponto) encontrado na string é assumido como o
// separador decimal; qualquer ocorrência anterior de "," ou "." é tratada
// como separador de milhar e removida. Se nenhum separador estiver presente,
// a string inteira é interpretada como reais inteiros.
export function parseReaisToCents(input: string): number | null {
  const cleaned = input.replace(/r\$\s*/i, "").trim();
  if (cleaned === "") return 0;
  const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  const normalized = lastSep === -1
    ? cleaned
    : `${cleaned.slice(0, lastSep).replace(/[.,]/g, "")}.${cleaned.slice(lastSep + 1)}`;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

// Centavos → texto para preencher o input. 0 → "" (Sob consulta).
export function centsToReaisInput(cents: number): string {
  if (!cents || cents <= 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
