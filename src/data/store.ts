// ───────────────────────────────────────────────────────────────────────────
// DADOS DA LOJA (estaticos)
//
// Informacoes institucionais e marcas parceiras exibidas na landing.
// ───────────────────────────────────────────────────────────────────────────

// Marcas parceiras exibidas na seção "Marcas" (logos em public/brand/marcas).
export const partnerBrands: { name: string; logo: string }[] = [
  { name: "3M", logo: "/brand/marcas/3m.webp" },
  { name: "Awlgrip", logo: "/brand/marcas/awlgrip.webp" },
  { name: "International", logo: "/brand/marcas/international.webp" },
  { name: "Norton", logo: "/brand/marcas/norton-saint-gobain.webp" },
  { name: "PropGlide", logo: "/brand/marcas/propglide-preto.webp" },
  { name: "Sika", logo: "/brand/marcas/sika.webp" },
  { name: "Sikkens", logo: "/brand/marcas/sikkens.webp" },
  { name: "WEG", logo: "/brand/marcas/weg.webp" }
];

// Informações da loja (mesmos valores do e-commerce).
export const store = {
  companyName: "Náutica Color",
  location: "Marina Verolme, Angra dos Reis - RJ",
  phone: "(24) 2404-4606",
  whatsappVisible: "(24) 99844-7844",
  whatsappVisible2: "(24) 99303-7332",
  instagram: "@nauticacolor",
  heroImage: "/hero/hero-nautica.png"
};
