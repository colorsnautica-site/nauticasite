"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const productImages = [
  { src: "/products/examples/weg-tinta-galao.png", alt: "Tintas e revestimentos para embarcações" },
  { src: "/products/examples/3m-finesse-it-polish.png", alt: "Produtos para polimento e acabamento náutico" },
  { src: "/products/examples/weg-diluente.png", alt: "Diluentes e complementos para pintura náutica" },
  { src: "/products/examples/sikaflex-295-uv.png", alt: "Selantes e adesivos para aplicações náuticas" },
  { src: "/products/examples/lixa-norton.png", alt: "Abrasivos para preparação e manutenção de embarcações" }
];

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToImage = (index: number) => {
    setActiveIndex((index + productImages.length) % productImages.length);
  };

  return (
    <div className="mt-10">
      <p className="mx-auto mb-5 max-w-xl text-center text-sm font-medium text-navy/70">
        Da preparação ao acabamento, você encontra produtos profissionais e atendimento especializado para cuidar da sua
        embarcação.
      </p>

      <div className="relative mx-auto max-w-[340px] px-1" aria-label="Produtos disponíveis na Náutica Color">
        <div className="relative overflow-hidden rounded-3xl bg-sky">
          <div
            className="flex transition-transform duration-500 ease-nautica"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {productImages.map((image) => (
              <figure key={image.src} className="aspect-[4/3] w-full shrink-0">
                <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-navy/20" />
        </div>

        <button
          type="button"
          onClick={() => goToImage(activeIndex - 1)}
          aria-label="Ver imagem anterior"
          className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center text-white drop-shadow-md transition hover:scale-110"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goToImage(activeIndex + 1)}
          aria-label="Ver próxima imagem"
          className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center text-white drop-shadow-md transition hover:scale-110"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2" aria-label="Posição do carrossel">
        {productImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => goToImage(index)}
            aria-label={`Ir para a imagem ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-8 bg-red" : "w-2 bg-navy/20 hover:bg-navy/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
