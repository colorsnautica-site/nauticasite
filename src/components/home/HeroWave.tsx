"use client";

import { useEffect, useRef } from "react";

/**
 * Onda do hero. O deslize horizontal continua via CSS (`animate-wave`); o
 * movimento vertical (sobe e desce) é dirigido pela posição do scroll do
 * usuário — quanto mais ele rola, mais a onda balança suavemente. Respeita
 * `prefers-reduced-motion`: se ativo, a onda fica estática.
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
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          className="block h-16 w-[200%] animate-wave sm:h-20"
        >
          <path
            fill="#ffffff"
            d="M0,50 C360,100 1080,0 1440,50 C1800,100 2520,0 2880,50 L2880,120 L0,120 Z"
          />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-7 bg-white" />
    </div>
  );
}
