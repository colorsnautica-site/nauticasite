/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { WhatsappIcon } from "@/components/WhatsappIcon";

// Seções do site para a navegação do header.
const SECTIONS = [
  { href: "#produtos", label: "Produtos" },
  { href: "#marcas", label: "Marcas" },
  { href: "#atendimento", label: "Atendimento" },
  { href: "#contato", label: "Contato" },
] as const;

/**
 * Cabeçalho enxuto da landing: logo + um CTA de WhatsApp.
 *
 * O final (base) do header é uma onda PARADA que funciona como lâmina d'água: o
 * fundo branco do header fica ACIMA da curva; o azul-marinho da Náutica
 * (#002659) é a "água" que preenche ABAIXO da curva, subindo da esquerda para a
 * direita na proporção do scroll. A onda (formato) não se move.
 */
// Silhueta branca: preenche ACIMA da curva (mid y6, viewBox 60x12). Usada como
// máscara do painel, recortando a base do header no formato da onda.
const WAVE_WHITE =
  `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='12'%20viewBox='0%200%2060%2012'%3E%3Cpath%20d='M0%206%20Q15%203%2030%206%20T60%206%20V0%20H0%20Z'%20fill='%23ffffff'/%3E%3C/svg%3E")`;
// Água navy: FAIXA que acompanha a onda — topo na curva (mid y6) e base numa
// curva paralela (mid y12), espessura constante. viewBox 60x18.
const WAVE_NAVY =
  `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='18'%20viewBox='0%200%2060%2018'%3E%3Cpath%20d='M0%206%20Q15%203%2030%206%20Q45%209%2060%206%20L60%2012%20Q45%2015%2030%2012%20Q15%209%200%2012%20Z'%20fill='%23002659'/%3E%3C/svg%3E")`;
export function Header({ supportUrl }: { supportUrl: string }) {
  const [progress, setProgress] = useState(0); // 0..1 do scroll total da página

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Painel de fundo (branco translúcido + blur) cuja BORDA INFERIOR é a
          onda: estende-se 12px abaixo do header e é recortado por uma máscara
          opaca em cima + onda na base. Assim o header termina na curva, sem
          aresta reta. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -bottom-3 bg-white/95 backdrop-blur"
        style={{
          WebkitMaskImage: `linear-gradient(#000, #000), ${WAVE_WHITE}`,
          maskImage: `linear-gradient(#000, #000), ${WAVE_WHITE}`,
          WebkitMaskRepeat: "no-repeat, repeat-x",
          maskRepeat: "no-repeat, repeat-x",
          WebkitMaskSize: "100% calc(100% - 12px), 60px 12px",
          maskSize: "100% calc(100% - 12px), 60px 12px",
          WebkitMaskPosition: "top left, bottom left",
          maskPosition: "top left, bottom left",
        }}
      />

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#topo" className="flex items-center gap-3" aria-label="Náutica Color">
          <img src="/brand/nautica-color-logo.png" alt="Náutica Color" className="h-11 w-auto sm:h-12" />
        </a>

        {/* Navegação para as seções (desktop). */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/80 md:flex">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className="transition hover:text-red">
              {s.label}
            </a>
          ))}
        </nav>

        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red px-4 text-xs font-semibold text-white transition hover:bg-red-bright sm:px-5"
        >
          <WhatsappIcon className="h-3.5 w-3.5" />{" "}
          <span className="hidden sm:inline">Falar no WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

      {/* Água navy: faixa que acompanha a onda (topo e base ondulados, mesma
          curva da borda do painel), subindo da esquerda para a direita
          conforme o scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-[18px]"
      >
        <div
          className="header-edge-wave absolute inset-y-0 left-0"
          style={{ width: `${progress * 100}%`, backgroundImage: WAVE_NAVY }}
        />
      </div>
    </header>
  );
}
