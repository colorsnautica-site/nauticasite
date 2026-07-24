/* eslint-disable @next/next/no-img-element */
import type { PartnerBrandRow } from "@/db/schema";

/**
 * Carrossel infinito das marcas parceiras. Renderiza a lista duas vezes em uma
 * trilha flex e desliza `translateX(-50%)` (keyframe `marquee`, em globals.css):
 * como cada item carrega sua própria margem à direita, meia trilha equivale
 * exatamente a uma cópia — o loop é contínuo, sem emenda. As bordas têm um
 * fade (mask) que revela/oculta os logos suavemente, e o movimento pausa ao
 * passar o mouse. Respeita `prefers-reduced-motion` (animação desativada em
 * globals.css).
 *
 * `brands` vem do banco (`getBrands()`, editável em /admin/marcas).
 */
export function BrandsMarquee({ brands }: { brands: PartnerBrandRow[] }) {
  if (brands.length === 0) return null;

  // Duas cópias: a segunda é decorativa (escondida de leitores de tela).
  const loop = [...brands, ...brands];

  return (
    <div
      className="group relative mt-10 overflow-hidden [--marquee-fade:7%] [mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade),black_calc(100%_-_var(--marquee-fade)),transparent)]"
    >
      <ul className="flex w-max animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
        {loop.map((brand, index) => (
          <li
            key={`${brand.id}-${index}`}
            aria-hidden={index >= brands.length || undefined}
            className="mr-4 w-40 shrink-0 sm:mr-6 sm:w-48"
          >
            <div className="grid h-full place-items-center p-6">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                loading="lazy"
                className="max-h-12 w-auto max-w-full object-contain"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
