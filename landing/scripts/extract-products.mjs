import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const SOURCE_DIR = "C:\\Users\\drive\\Documents\\Produtos Nautica";
const OUT_DIR = path.resolve(import.meta.dirname, "..", "src", "data", "products");

const CATEGORIES = [
  { file: "Linha Nautica.pdf", slug: "linha-nautica", name: "Linha Náutica" },
  { file: "Linha automotiva.pdf", slug: "linha-automotiva", name: "Linha Automotiva" },
  { file: "Adesivos e Selantes.pdf", slug: "adesivos-e-selantes", name: "Adesivos e Selantes" },
  { file: "Polimento.pdf", slug: "polimento", name: "Polimento" },
  { file: "Abrasivos.pdf", slug: "abrasivos", name: "Abrasivos" },
  { file: "Acessorios.pdf", slug: "acessorios", name: "Acessórios" },
  { file: "Ferramentas.pdf", slug: "ferramentas", name: "Ferramentas" }
];

// Ordem: nomes mais especificos primeiro (ex.: "SIKAFLEX" antes de "SIKA").
const BRAND_KEYWORDS = [
  ["3M", "3M"],
  ["SIKAFLEX", "Sikaflex"],
  ["SIKASIL", "Sika"],
  ["SIKA ", "Sika"],
  ["SIKKENS", "Sikkens"],
  ["NORTON", "Norton"],
  ["VONIXX", "Vonixx"],
  ["VONIX ", "Vonix"],
  ["TEKBOND", "Tekbond"],
  ["TEK BOND", "Tekbond"],
  ["TEKSPRAY", "Tekbond"],
  ["TEKBOD", "Tekbond"],
  ["WURTH", "Wurth"],
  ["AWLGRIP", "Awlgrip"],
  ["AWLCAT", "Awlgrip"],
  ["AWLCRAFT", "Awlgrip"],
  ["WEG", "WEG"],
  ["LOCTITE", "Loctite"],
  ["ARALDITE", "Araldite"],
  ["CASCOLA", "Cascola"],
  ["PEROLA", "Pérola"],
  ["INTERCLENE", "International"],
  ["INTERGARD", "International"],
  ["INTERSHIELD", "International"],
  ["INTERMARINE", "International"],
  ["INTERLAC", "International"],
  ["INTERTUF", "International"],
  ["INTERNACIONAL", "International"],
  ["BOSCH", "Bosch"],
  ["MTX", "MTX"],
  ["STARRET", "Starrett"],
  ["SPARTA", "Sparta"],
  ["VONDER", "Vonder"],
  ["TIGRE", "Tigre"],
  ["ROLY", "Roly"],
  ["JABSCO", "Jabsco"],
  ["GENEBRE", "Genebre"],
  ["CARBOGRAFITE", "Carbografite"],
  ["MAZA", "Maza"],
  ["MAZADUR", "Maza"],
  ["ANJO", "Anjo"],
  ["LAZZURIL", "Lazzuril"],
  ["LAZZUDUR", "Lazzuril"],
  ["PPG", "PPG"],
  ["WANDA", "Wanda"],
  ["AUTOCOLOR", "Autocolor"],
  ["LAGOLINE", "Lagoline"],
  ["MICRON", "Micron"],
  ["PROPGLIDE", "Propglide"],
  ["PROPSPEED", "Propspeed"],
  ["PROP BOAT", "Propspeed"],
  ["FAPI", "Fapi"],
  ["BELTOOLS", "Beltools"],
  ["NAUTISPECIAL", "Nautispecial"],
  ["ATLAS", "Atlas"],
  ["PALISAD", "Palisad"],
  ["ACRILEX", "Acrilex"],
  ["WD40", "WD-40"],
  ["WD 40", "WD-40"],
  ["TRUDSING", "Trudsing"],
  ["TRDSING", "Trudsing"],
  ["PROFIX", "Profix"],
  ["GALVERETTE", "Galverette"],
  ["PERFECTION", "Perfection"],
  ["MONTANA", "Montana"],
  ["BOATFLON", "Boatflon"],
  ["LIGHTSPEED", "Lightspeed"],
  ["PURPLEX", "Purplex"],
  ["PURBLEX", "Purplex"],
  ["ORTON", "Norton"],
  ["POLIMAX", "Polimax"],
  ["AMERICA ", "America"],
  ["BLEND", "Vonixx"],
  ["NORCLEAN", "Norton"]
];

function detectBrand(description) {
  const upper = description.toUpperCase();
  for (const [keyword, brand] of BRAND_KEYWORDS) {
    if (upper.includes(keyword)) return brand;
  }
  return "";
}

const PLACEHOLDER_IMAGES = [
  "/products/examples/weg-tinta-galao.png",
  "/products/examples/3m-finesse-it-polish.png",
  "/products/examples/weg-diluente.png",
  "/products/examples/sikaflex-295-uv.png",
  "/products/examples/lixa-norton.png"
];

// Ex.: "00865 3M ADESIVO JUNTA DIESEL MOTOR 73GR UN 16,00 ______________"
// Alguns PDFs tem um artefato de extração (ex.: "]") entre a unidade e o saldo.
const ROW_RE = /^(\d{4,6})\s+(.+?)\s+([A-Z]{1,4})\s+\]?\s*(-?\d{1,3}(?:\.\d{3})*,\d{2})\s*_*\s*$/;

function parseSaldo(raw) {
  return Number(raw.replace(/\./g, "").replace(",", "."));
}

// Conectivos que ficam em minusculo (estilo titulo em pt-BR).
const STOPWORDS = new Set(["de", "da", "do", "das", "dos", "e", "em", "para", "com", "sem", "no", "na", "ou", "a", "o"]);

function toTitleCase(description) {
  return description
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (STOPWORDS.has(lower)) return lower;
      // Preserva medidas/tamanhos (contem digito: "3,785L", "73GR") e siglas
      // curtas em maiusculo (ex.: "3M", "PU", "UV", "GL").
      if (/\d/.test(word)) return word;
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

async function extractCategory(category, index) {
  const filePath = path.join(SOURCE_DIR, category.file);
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();

  const lines = result.text.split("\n");
  const products = [];

  for (const line of lines) {
    const match = ROW_RE.exec(line.trim());
    if (!match) continue;
    const [, sku, rawDescription, unit, rawSaldo] = match;
    const saldo = parseSaldo(rawSaldo);
    const description = rawDescription.trim();

    products.push({
      id: sku,
      sku,
      name: toTitleCase(description),
      categorySlug: category.slug,
      brandName: detectBrand(description),
      priceCents: 0,
      unit,
      stockStatus: saldo > 0 ? "available" : "on_request",
      imageUrl: PLACEHOLDER_IMAGES[(index + products.length) % PLACEHOLDER_IMAGES.length]
    });
  }

  // Conferencia: linhas nao reconhecidas (fora cabecalho/rodape/pagina) ajudam a
  // flagrar regex incompleta.
  let skipped = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (ROW_RE.test(trimmed)) continue;
    const isKnownNoise =
      /^(NAUTICA REIS|CONTAGEM DE ESTOQUE|Página|Empresa|Lote|Saldos|Linha\/Grupo|Fornecedor|Grupo de Compra|Referência|Localização|Unidade|Status|Exportação|Exibir|CÓDIGO|REL:|\d{2}\/\d{2}\/\d{4})/.test(
        trimmed
      );
    if (!isKnownNoise) skipped++;
  }

  return { products, skipped };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary = [];
  const allCategories = [];

  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    const { products, skipped } = await extractCategory(category, i);

    const varName = category.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + "Products";
    const fileContent = `import type { Product } from "../catalog";

export const ${varName}: Product[] = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(path.join(OUT_DIR, `${category.slug}.ts`), fileContent, "utf8");

    allCategories.push({ ...category, varName, count: products.length });
    summary.push({ category: category.name, count: products.length, skipped });
  }

  const indexContent =
    'import type { Product } from "../catalog";\n' +
    allCategories.map((c) => `import { ${c.varName} } from "./${c.slug}";`).join("\n") +
    "\n\nexport const productsBySlug: Record<string, Product[]> = {\n" +
    allCategories.map((c) => `  "${c.slug}": ${c.varName}`).join(",\n") +
    "\n};\n";
  fs.writeFileSync(path.join(OUT_DIR, "index.ts"), indexContent, "utf8");

  console.table(summary);
  console.log(
    "Total:",
    summary.reduce((sum, s) => sum + s.count, 0)
  );
}

main();
