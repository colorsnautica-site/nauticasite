"use client";

import { useEffect, useRef } from "react";

/**
 * Onda do hero em camadas (parallax). Três cópias da mesma curva deslizam na
 * horizontal em velocidades diferentes (CSS `wave-move-forever`, definido em
 * globals.css), criando profundidade. As cores seguem a paleta da Náutica:
 * camadas de trás em azul-claro da marca (sky/mist) sobre o navy do hero e a
 * camada da frente em branco (#ffffff), igual ao fundo `bg-white` das seções
 * abaixo, para fundir sem deixar linha de emenda.
 *
 * O movimento vertical (sobe/desce) acompanha o scroll do usuário e respeita
 * `prefers-reduced-motion` (tratado globalmente em globals.css).
 */
export function HeroWave() {
  const bobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bobRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Amplitude do balanço (px) e "passo" do scroll (px) por ciclo da onda.
    const AMPLITUDE = 6;
    const STEP = 140;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.sin(window.scrollY / STEP) * AMPLITUDE;
      el.style.transform = `translateY(${y}px)`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
    >
      {/* Base branca do "mar": cobre o pé do hero (do fim da seção até a linha
          da onda) para que TODA a onda possa ser elevada (bottom-16) sem
          revelar o azul do hero por baixo dela. Subir/baixar esse h-16 + o
          bottom-16 da faixa abaixo (mantendo-os iguais) move toda a onda. */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-white" />
      {/* Faixa da onda, elevada para subir todas as ondas no hero. */}
      <div className="absolute inset-x-0 bottom-28 overflow-hidden">
        <div ref={bobRef} className="will-change-transform">
          <svg
            viewBox="0 0 120 48"
            preserveAspectRatio="none"
            className="block h-12 w-full sm:h-16"
          >
            <defs>
              {/* Onda senoidal contínua: cristas e cavas alternadas em torno da
                  linha média (y=19) — cada onda emenda na próxima pela curva
                  descendente, sem trecho reto.

                  Período = 160 (> largura do viewBox 120), então cabe ~0,75 de
                  onda: uma única ondulação ampla e gentil cruzando a tela. Como
                  o SVG usa preserveAspectRatio="none" e é esticado para a
                  largura da tela, mantemos amplitude alta (cristas y=1 / cavas
                  y=37) para a curvatura não achatar. A animação desliza
                  exatamente -160px por ciclo (= período), então o loop é
                  imperceptível. O caminho cobre de x=-120 a x=+360 (bem além
                  das bordas) para nunca mostrar fresta da seção. */}
              <path
                id="gentle-wave"
                d="M-120 19 c24 -18 56 -18 80 0 s56 18 80 0 c24 -18 56 -18 80 0 s56 18 80 0 c24 -18 56 -18 80 0 s56 18 80 0 v49 h-480 z"
              />
            </defs>
            <g className="hero-waves">
              <use href="#gentle-wave" x="0" y="0" fill="#E8F0FA" fillOpacity="0.2" />
              <use href="#gentle-wave" x="45" y="3" fill="#D7E5F4" fillOpacity="0.5" />
              <use href="#gentle-wave" x="25" y="6" fill="#ffffff" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
