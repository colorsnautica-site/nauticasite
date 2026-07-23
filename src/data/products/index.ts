import type { Product } from "../catalog";
import { linhaNauticaProducts } from "./linha-nautica";
import { linhaAutomotivaProducts } from "./linha-automotiva";
import { adesivosESelantesProducts } from "./adesivos-e-selantes";
import { polimentoProducts } from "./polimento";
import { abrasivosProducts } from "./abrasivos";
import { acessoriosProducts } from "./acessorios";
import { ferramentasProducts } from "./ferramentas";

export const productsBySlug: Record<string, Product[]> = {
  "linha-nautica": linhaNauticaProducts,
  "linha-automotiva": linhaAutomotivaProducts,
  "adesivos-e-selantes": adesivosESelantesProducts,
  "polimento": polimentoProducts,
  "abrasivos": abrasivosProducts,
  "acessorios": acessoriosProducts,
  "ferramentas": ferramentasProducts
};
