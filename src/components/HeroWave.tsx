"use client";

import { useEffect, useRef } from "react";

/**
 * Onda do hero em camadas (parallax). Três cópias da mesma curva deslizam na
 * horizontal em velocidades diferentes (CSS `wave-move-forever`, em globals.css),
 * criando profundidade. A camada da frente é branca (#ffffff), igual ao fundo das
 * seções abaixo, para fundir sem deixar linha de emenda. O movimento vertical
 * acompanha o scroll e respeita `prefers-reduced-motion`.
 */
export function HeroWave() {
  const bobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bobRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const AMPLITUDE = 2;
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
      <div
        ref={bobRef}
        className="absolute inset-x-0 bottom-0 will-change-transform"
      >
        {/* Base branca do "mar" cobrindo o navy abaixo da faixa da onda. */}
        <div className="absolute inset-x-0 bottom-[-240px] h-[306px] bg-white" />
        <div className="absolute inset-x-0 bottom-[64px] overflow-hidden">
          <svg
            viewBox="0 0 120 48"
            preserveAspectRatio="none"
            className="block h-12 w-full sm:h-16"
          >
            <defs>
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
