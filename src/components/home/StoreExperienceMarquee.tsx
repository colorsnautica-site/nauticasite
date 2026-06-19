"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Marquee de fotos da loja dirigido pelo scroll: conforme a seção atravessa a
 * viewport, a faixa desliza na horizontal acompanhando a rolagem do mouse.
 *
 * - `useScroll` mede o progresso da seção (0 ao entrar por baixo, 1 ao sair por
 *   cima); `useTransform` mapeia esse progresso para um deslocamento horizontal.
 * - `useSpring` suaviza o movimento para não ficar preso "grudado" ao scroll.
 * - A lista é duplicada para ter fotos suficientes durante todo o trajeto.
 * - Com `prefers-reduced-motion`, a faixa fica estática (sem transform).
 */

const photos = [
  { src: "/experiencia/loja-01.jpg", alt: "Corredor da Náutica Color com prateleiras de tintas, antifouling e abrasivos" },
  { src: "/experiencia/loja-02.jpg", alt: "Balcão de atendimento da Náutica Color com selantes e acessórios náuticos" },
  { src: "/experiencia/loja-03.jpg", alt: "Estoque variado de produtos náuticos exposto na loja Náutica Color" }
];

// Lista duplicada para manter fotos preenchendo a faixa durante todo o scroll.
const marquee = [...photos, ...photos];

export function StoreExperienceMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const xRaw = useTransform(scrollYProgress, [0, 1], ["2%", "-52%"]);
  const x = useSpring(xRaw, { stiffness: 90, damping: 30, mass: 0.4 });

  return (
    <div
      ref={ref}
      className="relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <motion.div style={reduce ? undefined : { x }} className="flex w-max gap-5">
        {marquee.map((photo, index) => (
          <figure
            key={index}
            aria-hidden={index >= photos.length ? "true" : undefined}
            className="relative aspect-[21/9] w-[280px] shrink-0 overflow-hidden rounded-lg shadow-soft ring-1 ring-navy/10 sm:w-[360px]"
          >
            <img
              src={photo.src}
              alt={index >= photos.length ? "" : photo.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-nautica hover:scale-105"
            />
          </figure>
        ))}
      </motion.div>
    </div>
  );
}
