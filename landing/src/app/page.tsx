/* eslint-disable @next/next/no-img-element */
import { Anchor, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { HeroWave } from "@/components/HeroWave";
import { StoreExperience } from "@/components/StoreExperience";
import { ProductShowcase } from "@/components/ProductShowcase";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { Eyebrow } from "@/components/Eyebrow";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";
import { store } from "@/data/showcase";

/**
 * LANDING PAGE — app independente do e-commerce.
 *
 * Vitrine de produtos + WhatsApp. Sem carrinho, sem catálogo e sem dados
 * externos: tudo funila para o atendimento via WhatsApp. Os produtos da vitrine
 * e as infos da loja ficam em src/data/showcase.ts.
 */
export default function LandingPage() {
  const whatsappNumber = resolveWhatsappNumber();
  const supportUrl = whatsappUrl(buildSupportMessage(), whatsappNumber);

  return (
    <>
      <Header supportUrl={supportUrl} />
      <main id="topo">
        <section className="relative isolate overflow-hidden bg-navy text-white">
          {/* Foto de fundo do hero (full-bleed). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-navy bg-cover bg-center"
            style={{ backgroundImage: `url('${store.heroImage}')` }}
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy/95 via-navy/70 to-navy-light/55" />
          <div aria-hidden="true" className="absolute -right-24 top-4 -z-10 h-80 w-80 rounded-full bg-red/20 blur-3xl" />

          <div className="mx-auto flex min-h-[680px] max-w-7xl flex-col items-center justify-center gap-8 px-4 pb-52 pt-24 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <p className="mb-5 inline-flex animate-fade-up items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-red">
                <Anchor size={14} aria-hidden="true" /> Náutica Color
              </p>
              <h1 className="animate-fade-up font-heading text-2xl font-extrabold leading-[1.1] [animation-delay:80ms] sm:text-3xl lg:text-4xl">
                Tudo para a sua embarcação.
              </h1>
              <p className="mx-auto mt-5 max-w-xl animate-fade-up text-sm leading-7 text-white/80 [animation-delay:160ms]">
                Tintas, antifouling, acabamentos e abrasivos de alta performance. Escolha o produto e fale direto com a equipe pelo WhatsApp.
              </p>
            </div>

            <div className="flex animate-fade-up flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red px-7 text-sm font-semibold text-white shadow-soft transition hover:bg-red-bright"
              >
                <WhatsappIcon className="h-[18px] w-[18px]" /> Falar com o atendimento
              </a>
            </div>

            <div className="flex animate-fade-up flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-white/75 [animation-delay:300ms]">
              {[
                [ShieldCheck, "Linha profissional"],
                [MessageCircle, "Atendimento pelo WhatsApp"],
                [MapPin, "Marina Verolme · Angra dos Reis"]
              ].map(([Icon, label]) => (
                <span key={String(label)} className="inline-flex items-center gap-2">
                  <Icon className="text-red" size={18} aria-hidden="true" /> {String(label)}
                </span>
              ))}
            </div>
          </div>

          <HeroWave />
        </section>

        <section id="produtos" className="scroll-mt-20 bg-white pb-20 pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Produtos em destaque</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Encontre o produto certo para a sua embarcação.
              </h2>
              <p className="mt-4 text-ink/70">
                Conheça alguns dos produtos disponíveis na Náutica Color e fale diretamente com nossa equipe pelo WhatsApp.
                Tire dúvidas, confirme valores e disponibilidade e receba ajuda para escolher a melhor solução para cada
                etapa do serviço.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <ProductShowcase />
            </ScrollReveal>
          </div>
        </section>

        <StoreExperience supportUrl={supportUrl} />

        <section id="contato" className="bg-white py-20">
          <ScrollReveal className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <MapPin className="mx-auto mb-5 text-red" size={34} aria-hidden="true" />
            <div className="flex justify-center">
              <Eyebrow>Contato</Eyebrow>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Atendimento na Marina Verolme.</h2>

            {/* Restante do texto distribuído numa linha pela página, sem caixa. */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm leading-6 text-ink/70">
              <span>{store.location}</span>
              <span>
                Telefone:{" "}
                <a href={`tel:+55${store.phone.replace(/\D/g, "")}`} className="font-medium text-navy underline-offset-2 hover:text-red hover:underline">
                  {store.phone}
                </a>
              </span>
              <span>
                WhatsApp:{" "}
                <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-navy underline-offset-2 hover:text-red hover:underline">
                  {store.whatsappVisible}
                </a>
              </span>
              <span>
                WhatsApp:{" "}
                <a href={whatsappUrl(buildSupportMessage(), "5524993037332")} target="_blank" rel="noopener noreferrer" className="font-medium text-navy underline-offset-2 hover:text-red hover:underline">
                  {store.whatsappVisible2}
                </a>
              </span>
            </div>

            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright">
              <WhatsappIcon className="h-[18px] w-[18px]" /> Chamar no WhatsApp
            </a>
          </ScrollReveal>
        </section>

        <section id="marcas" className="scroll-mt-20 bg-white py-20">
          <ScrollReveal className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <Eyebrow>Marcas parceiras</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Linhas profissionais em um catálogo único.</h2>
          </ScrollReveal>
          <ScrollReveal delay={180}>
            <BrandsMarquee />
          </ScrollReveal>
        </section>

        <footer className="bg-navy py-8 text-center text-xs text-white/60">
          <p>© Náutica Color · {store.location}</p>
        </footer>

        <a href={supportUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Náutica Color pelo WhatsApp" className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center text-red drop-shadow-lg transition hover:scale-110 hover:text-red-bright sm:bottom-6">
          <WhatsappIcon className="h-14 w-14" backdrop />
        </a>
      </main>
    </>
  );
}
