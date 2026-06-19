import { MapPin, MessageCircle, PackageCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StoreExperienceMarquee } from "@/components/home/StoreExperienceMarquee";

/**
 * Seção "Prontos para te atender": mostra a estrutura física e o atendimento
 * da loja. O carrossel de fotos (StoreExperienceMarquee) é dirigido pelo scroll
 * — a faixa desliza na horizontal acompanhando a rolagem do mouse.
 */

const reasons: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PackageCheck, title: "Estoque completo", text: "Tintas, antifouling, abrasivos, fiberglass e acabamentos na prateleira." },
  { icon: Users, title: "Equipe que entende de barco", text: "Indicação certa de produto, rendimento e preparação para cada caso." },
  { icon: MapPin, title: "Pertinho da sua embarcação", text: "Atendimento presencial na Marina Verolme, em Angra dos Reis." }
];

export function StoreExperience({ supportUrl }: { supportUrl: string }) {
  return (
    <section id="atendimento" className="overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Atendimento</Eyebrow>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
            Prontos para te atender.
          </h2>
          <p className="mt-4 text-ink/70">
            Uma loja física de verdade, com a prateleira cheia e gente que conhece o produto. Passe na Marina Verolme ou
            chame pelo WhatsApp: a gente encontra a solução certa para a sua embarcação.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-2.5 rounded-lg border border-navy/10 bg-white p-3 transition-shadow hover:shadow-soft">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky text-navy">
                <Icon size={16} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold leading-tight text-navy">{title}</h3>
                <p className="mt-0.5 text-xs leading-4 text-ink/65">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrossel de fotos da loja dirigido pelo scroll (full-bleed). */}
      <StoreExperienceMarquee />

      <div className="mx-auto mt-10 flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright"
        >
          <MessageCircle size={18} aria-hidden="true" /> Falar com a equipe
        </a>
      </div>
    </section>
  );
}
