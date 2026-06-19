"use client";

import { useEffect, useRef } from "react";

/**
 * Onda do hero em camadas (parallax). Três cópias da mesma curva deslizam na
 * horizontal em velocidades diferentes (CSS `wave-move-forever`, definido em
 * globals.css), criando profundidade. As cores seguem a paleta da Náutica:
 * camadas de trás em azul-claro da marca (sky/mist) sobre o navy do hero e a
 * camada da frente em branco, que funde com a seção branca abaixo.
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
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden"
    >
      <div ref={bobRef} className="will-change-transform">
        <svg
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          className="block h-16 w-full sm:h-20"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="hero-waves">
            <use href="#gentle-wave" x="80" y="0" fill="#E8F0FA" fillOpacity="0.2" />
            <use href="#gentle-wave" x="40" y="3" fill="#D7E5F4" fillOpacity="0.5" />
            <use href="#gentle-wave" x="40" y="6" fill="#ffffff" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-7 bg-white" />
    </div>
  );
}
