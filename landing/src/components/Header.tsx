/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { WhatsappIcon } from "@/components/WhatsappIcon";

/**
 * Cabeçalho enxuto da landing: logo + um CTA de WhatsApp.
 *
 * Animação de scroll: conforme a página rola para baixo, uma faixa azul-marinho
 * (cor da Náutica, #002659) preenche o header da esquerda para a direita. Na
 * borda direita desse preenchimento corre uma onda vertical animada — a mesma
 * linguagem visual da onda do hero. O conteúdo (logo + botão) é duplicado em
 * versão clara e revelado exatamente sobre o azul, para manter a legibilidade.
 */
export function Header({ supportUrl }: { supportUrl: string }) {
  const headerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 do scroll total da página
  const [headerWidth, setHeaderWidth] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => setHeaderWidth(el.clientWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

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
      ro.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const fillPx = progress * headerWidth;
  const WAVE_W = 64; // largura do SVG da onda (px)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 overflow-hidden bg-white/95 backdrop-blur"
    >
      {/* Conteúdo: logo + botão. O preenchimento azul sobe por cima e os
          encobre conforme o scroll avança. */}
      <HeaderInner supportUrl={supportUrl} />

      {/* Faixa azul que preenche da esquerda para a direita, cobrindo o
          conteúdo. Recortada pela largura do scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 bg-navy"
        style={{ width: `${fillPx}px` }}
      />

      {/* Onda vertical na borda do preenchimento (visível só durante o scroll). */}
      <ScrollWave leftPx={fillPx} width={WAVE_W} visible={progress > 0.001} />
    </header>
  );
}

function HeaderInner({ supportUrl }: { supportUrl: string }) {
  return (
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a
        href="#topo"
        className="flex items-center gap-3"
        aria-label="Náutica Color"
      >
        <img src="/brand/nautica-color-logo.png" alt="Náutica Color" className="h-10 w-auto" />
      </a>
      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red px-4 text-sm font-semibold text-white transition hover:bg-red-bright sm:px-5"
      >
        <WhatsappIcon className="h-4 w-4" />{" "}
        <span className="hidden sm:inline">Falar no WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
    </div>
  );
}

/**
 * Onda vertical desenhada na borda do preenchimento azul, no mesmo espírito da
 * onda do hero: três camadas (parallax) da mesma curva, com opacidades e
 * velocidades diferentes, deslizando na vertical (`header-wave-flow`, em
 * globals.css). A camada da frente é navy opaco e define a borda do
 * preenchimento; as de trás são navy translúcido e avançam um pouco mais sobre
 * o branco, formando a "espuma". O comprimento de onda é largo, gerando uma
 * ondulação suave e ampla.
 */
function ScrollWave({
  leftPx,
  width,
  visible,
}: {
  leftPx: number;
  width: number;
  visible: boolean;
}) {
  // viewBox em unidades: largura `width`, altura 64 (= h-16). A fronteira do
  // preenchimento fica no x central; as cristas avançam para a direita.
  const H = 64;
  const L = 88; // comprimento de onda bem largo (em unidades de y)
  const AMP = 14; // avanço da crista da camada principal sobre a borda
  const BOUNDARY = width / 2; // x da borda reta da faixa

  // Curva única, ladrilhada bem além do viewBox (-2L..H+2L) para que o
  // translateY contínuo da animação nunca mostre emenda.
  const d = buildWavePath({
    top: -2 * L,
    bottom: H + 2 * L,
    L,
    trough: BOUNDARY,
    crest: BOUNDARY + AMP,
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 z-[1] will-change-transform"
      style={{
        left: `${leftPx - width / 2}px`,
        width: `${width}px`,
        opacity: visible ? 1 : 0,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <path id="header-vwave" d={d} />
        </defs>
        {/* Trás → frente: espuma translúcida adiantada e, por cima, a camada
            opaca que casa com a faixa azul (vale na borda exata). */}
        <g className="header-wave">
          <use href="#header-vwave" x={12} y={26} fill="#002659" fillOpacity={0.22} />
          <use href="#header-vwave" x={6} y={53} fill="#002659" fillOpacity={0.5} />
          <use href="#header-vwave" x={0} y={0} fill="#002659" />
        </g>
      </svg>
    </div>
  );
}

function buildWavePath({
  top,
  bottom,
  L,
  trough,
  crest,
}: {
  top: number;
  bottom: number;
  L: number;
  trough: number;
  crest: number;
}) {
  const half = L / 2;
  let d = `M0 ${top} L${trough} ${top}`;
  let y = top;
  let atTrough = true;
  // Cada meio comprimento de onda é uma curva S de vale->crista ou crista->vale.
  while (y < bottom) {
    const from = atTrough ? trough : crest;
    const to = atTrough ? crest : trough;
    const c = y + half / 2;
    const e = y + half;
    d += ` C${from} ${c} ${to} ${c} ${to} ${e}`;
    y = e;
    atTrough = !atTrough;
  }
  d += ` L0 ${y} Z`;
  return d;
}
