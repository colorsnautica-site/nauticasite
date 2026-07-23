/* eslint-disable @next/next/no-img-element */
import { partnerBrands } from "@/data/store";

/**
 * Carrossel infinito das marcas parceiras. Renderiza a lista duas vezes em uma
 * trilha flex e desliza `translateX(-50%)` (keyframe `marquee`, em globals.css):
 * como cada item carrega sua própria margem à direita, meia trilha equivale
 * exatamente a uma cópia — o loop é contínuo, sem emenda. As bordas têm um
 * fade (mask) que revela/oculta os logos suavemente, e o movimento pausa ao
 * passar o mouse. Respeita `prefers-reduced-motion` (animação desativada em
 * globals.css).
 */
export function BrandsMarquee() {
  // Duas cópias: a segunda é decorativa (escondida de leitores de tela).
  const loop = [...partnerBrands, ...partnerBrands];

  return (
    <div
      className="group relative mt-10 overflow-hidden [--marquee-fade:7%] [mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade),black_calc(100%_-_var(--marquee-fade)),transparent)]"
    >
      <ul className="flex w-max animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
        {loop.map((brand, index) => (
          <li
            key={`${brand.name}-${index}`}
            aria-hidden={index >= partnerBrands.length || undefined}
            className="mr-4 w-40 shrink-0 sm:mr-6 sm:w-48"
          >
            <div className="grid h-full place-items-center p-6">
              <img
                src={brand.logo}
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
