"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { MapPin, MessageCircle, PackageCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

/**
 * Seção "Prontos para te atender": texto + motivos + CTA de um lado e, do outro,
 * a pilha de fotos da loja dirigida pelo scroll. A seção inteira é a "trilha" de
 * scroll: enquanto ela atravessa a viewport, o conteúdo fica fixo (sticky) e as
 * fotos entram na diagonal e se empilham (a última, a fachada, fica na frente).
 * Com `prefers-reduced-motion` tudo vira um layout estático.
 */

type Photo = { src: string; alt: string };

const photos: Photo[] = [
  { src: "/experiencia/loja-01.webp", alt: "Interior da loja Náutica Color com prateleiras de produtos náuticos" },
  { src: "/experiencia/loja-02.webp", alt: "Corredor da Náutica Color com tintas, antifouling e abrasivos" },
  { src: "/experiencia/loja-03.webp", alt: "Exposição de produtos para manutenção de embarcações na Náutica Color" },
  { src: "/experiencia/loja-04.webp", alt: "Prateleiras de acabamentos e acessórios na Náutica Color" },
  { src: "/experiencia/loja-05.webp", alt: "Estoque variado de produtos náuticos na loja Náutica Color" },
  { src: "/experiencia/loja-06.webp", alt: "Balcão de atendimento da Náutica Color com selantes e acessórios" },
  { src: "/experiencia/loja-07.webp", alt: "Ambiente interno da Náutica Color com linha profissional de produtos" },
  { src: "/experiencia/marine-shop.webp", alt: "Expositor Sika Marine Shop com selantes e produtos náuticos" },
  // Última = fica na frente.
  { src: "/experiencia/fachada-site.webp", alt: "Fachada da loja Náutica Color na Marina Verolme" }
];

const total = photos.length;

const reasons: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PackageCheck, title: "Estoque completo", text: "Tintas, antifouling, abrasivos, fiberglass e acabamentos na prateleira." },
  { icon: Users, title: "Equipe que entende de barco", text: "Indicação certa de produto, rendimento e preparação para cada caso." },
  { icon: MapPin, title: "Pertinho da sua embarcação", text: "Atendimento presencial na Marina Verolme, em Angra dos Reis." }
];

function StackCard({ photo, index, progress }: { photo: Photo; index: number; progress: MotionValue<number> }) {
  // Empilhamento: cada foto entra na diagonal (canto inferior direito → repouso)
  // no seu trecho do scroll e FICA parada; a próxima entra por cima (z-index por
  // índice), terminando com a fachada na frente. A montagem acaba em FILL_END e
  // o resto do scroll é pausa com a pilha completa. Janelas dentro de [0,1].
  const FILL_END = 0.8;
  const seg = FILL_END / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  const fade = seg * 0.5;

  const x = useTransform(progress, [start, end], ["90%", "0%"]);
  const y = useTransform(progress, [start, end], ["90%", "0%"]);
  const scale = useTransform(progress, [start, end], [1.06, 1]);
  const rotate = useTransform(progress, [start, end], [6, 0]);
  const opacity = useTransform(progress, [start, start + fade], [0, 1]);

  return (
    <motion.figure
      initial={false}
      style={{ x, y, scale, rotate, opacity, zIndex: index }}
      className="absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-navy/10"
    >
      <img src={photo.src} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
      <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 font-heading text-xs font-bold tabular-nums tracking-wide text-white">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </motion.figure>
  );
}

function Intro() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex justify-center">
        <Eyebrow className="text-[10px]">Atendimento</Eyebrow>
      </div>
      <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight text-navy sm:text-3xl">
        Tudo para sua embarcação, em um só lugar.
      </h2>
      <p className="mt-4 text-sm leading-6 text-ink/70">
        Da preparação ao acabamento, do casco ao convés: estoque completo, marcas profissionais e uma equipe que conhece
        cada produto. Passe na Marina Verolme ou chame pelo WhatsApp: a gente encontra a solução certa para a sua
        embarcação.
      </p>

      <div className="mt-6 grid gap-2.5 text-left sm:grid-cols-3">
        {reasons.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-2 rounded-lg bg-white p-2 transition-shadow hover:shadow-soft">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sky text-navy">
              <Icon size={15} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-xs font-bold leading-tight text-navy">{title}</h3>
              <p className="mt-0.5 text-[11px] leading-4 text-ink/65">{text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function SupportButton({ supportUrl }: { supportUrl: string }) {
  return (
    <a
      href={supportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright"
    >
      <MessageCircle size={18} aria-hidden="true" /> Falar com a equipe
    </a>
  );
}

export function StoreExperience({ supportUrl }: { supportUrl: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // ref fica na trilha de scroll (abaixo do estágio fixo); o progresso vai de 0
  // (quando a trilha entra, logo após o estágio pinar) a 1 (fim da trilha).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // Suavização: a animação "persegue" o scroll com mola (stiffness baixa = mais
  // lenta e amanteigada) em vez de seguir o scroll 1:1.
  const progress = useSpring(scrollYProgress, { stiffness: 40, damping: 24, mass: 0.6 });

  // Fallback sem animação: texto + cards e um grid estático de fotos ao lado.
  if (reduce) {
    return (
      <section id="atendimento" className="bg-white py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 sm:px-6 lg:px-8">
          <Intro />
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.src} className="aspect-[3/2] overflow-hidden rounded-xl shadow-soft ring-1 ring-navy/10">
                <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
          <SupportButton supportUrl={supportUrl} />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Estágio fixo (sticky top-0): fica pinado enquanto a trilha de scroll
          abaixo rola e PERMANECE fixo enquanto a próxima seção sobe por cima
          (as duas estão no mesmo container relativo em page.tsx). */}
      <section id="atendimento" className="sticky top-0 flex h-screen items-center overflow-hidden bg-white py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Intro />

          {/* Pilha de fotos dirigida pelo scroll, abaixo do texto. Sombra só
              aqui no container (uma só), pra as 9 fotos empilhadas não somarem
              sombras e criarem um halo embaçado. */}
          <div className="relative aspect-[3/2] w-full max-w-xl rounded-2xl shadow-soft">
            {photos.map((photo, index) => (
              <StackCard key={photo.src} photo={photo} index={index} progress={progress} />
            ))}
          </div>
          <SupportButton supportUrl={supportUrl} />
        </div>
      </section>

      {/* Trilha de scroll (vazia) que dirige a montagem da pilha. Sua altura
          define quanto scroll a animação ocupa antes da próxima seção cobrir. */}
      <div ref={ref} aria-hidden style={{ height: `${total * 25}vh` }} />
    </>
  );
}
