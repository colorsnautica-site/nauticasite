/* eslint-disable @next/next/no-img-element */

import { MapPin, PackageCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsappIcon } from "@/components/WhatsappIcon";

/**
 * Seção "Atendimento": texto + motivos + CTA acima e, abaixo, uma fileira fixa
 * de fotos da loja. Sem animação de scroll — passar o mouse (ou tocar) numa
 * faixa a expande em acordeão, abrindo a foto.
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
  // Última = a fachada.
  { src: "/experiencia/fachada-site.webp", alt: "Fachada da loja Náutica Color na Marina Verolme" }
];

const reasons: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PackageCheck, title: "Estoque completo", text: "Tintas, antifouling, abrasivos, fiberglass e acabamentos na prateleira." },
  { icon: Users, title: "Equipe que entende de barco", text: "Indicação certa de produto, rendimento e preparação para cada caso." },
  { icon: MapPin, title: "Pertinho da sua embarcação", text: "Atendimento presencial na Marina Verolme, em Angra dos Reis." }
];

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
      <WhatsappIcon className="h-[18px] w-[18px]" /> Falar com a equipe
    </a>
  );
}

export function StoreExperience({ supportUrl }: { supportUrl: string }) {
  return (
    <section id="atendimento" className="bg-white py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="w-full">
          <Intro />
        </ScrollReveal>
        {/* Fileira fixa de fotos. Hover/toque numa faixa a expande (acordeão),
            abrindo a foto. */}
        <ScrollReveal delay={180} className="flex h-[34vh] w-full gap-1.5">
          {photos.map((photo, index) => (
            <figure
              key={photo.src}
              className="group relative h-full min-w-0 flex-1 cursor-pointer overflow-hidden rounded-lg shadow-sm ring-1 ring-navy/10 transition-[flex-grow] duration-500 ease-nautica hover:flex-[8] hover:shadow-soft hover:ring-navy/25"
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-navy px-1.5 py-0.5 font-heading text-[9px] font-bold tabular-nums tracking-wide text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
            </figure>
          ))}
        </ScrollReveal>
        <SupportButton supportUrl={supportUrl} />
      </div>
    </section>
  );
}
