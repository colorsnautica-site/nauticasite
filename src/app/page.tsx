/* eslint-disable @next/next/no-img-element */
import { Anchor, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { HeroWave } from "@/components/HeroWave";
import { StoreExperience } from "@/components/StoreExperience";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { Eyebrow } from "@/components/Eyebrow";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";
import { store } from "@/data/store";
import { categories, getProductsByCategory } from "@/data/catalog";
import { FeaturedCategories, type FeaturedGroup } from "@/components/products/FeaturedCategories";

/**
 * LANDING PAGE — app independente do e-commerce.
 *
 * Vitrine de produtos + WhatsApp. Sem carrinho e sem dados externos: tudo
 * funila para o atendimento via WhatsApp. Produtos por categoria ficam em
 * src/data/products/ (gerados por scripts/extract-products.mjs) e as infos
 * da loja em src/data/store.ts.
 */
export default function LandingPage() {
  const whatsappNumber = resolveWhatsappNumber();
  const supportUrl = whatsappUrl(buildSupportMessage(), whatsappNumber);
  const featuredGroups: FeaturedGroup[] = categories.map((category) => ({
    category,
    products: getProductsByCategory(category.slug).slice(0, 4)
  }));

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
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/95 from-0% via-navy/55 via-25% to-navy/5 to-55%" />
          <div aria-hidden="true" className="absolute -right-24 top-4 -z-10 h-80 w-80 rounded-full bg-red/20 blur-3xl" />

          <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl flex-col items-start justify-center gap-8 px-4 pb-52 pt-24 text-left sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex animate-fade-up items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] text-red">
                <Anchor size={16} aria-hidden="true" /> Náutica Color
              </p>
              <h1 className="animate-fade-up font-heading text-3xl font-extrabold leading-[1.1] [animation-delay:80ms] sm:text-4xl lg:text-5xl">
                <span className="block text-[1.625rem] sm:text-[2rem] lg:text-[2.5rem]">Tudo para a sua embarcação</span>
                <span
                  className="mt-1 block text-[2.75rem] sm:text-[3.25rem] lg:text-[3.75rem]"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  em um só lugar
                </span>
              </h1>
              <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-7 text-white/80 [animation-delay:160ms]">
                <span className="block sm:whitespace-nowrap">
                  Tintas, antifouling, acabamentos e abrasivos de alta performance.
                </span>
                <span className="block">
                  Escolha o produto e fale direto com a equipe pelo WhatsApp.
                </span>
              </p>
            </div>

            <div className="flex animate-fade-up flex-col items-start gap-3 [animation-delay:240ms] sm:flex-row">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red px-7 text-lg font-semibold text-white shadow-soft transition hover:bg-red-bright"
              >
                <WhatsappIcon className="h-[20px] w-[20px]" /> Falar com o atendimento
              </a>
            </div>

            <div className="flex animate-fade-up flex-col gap-y-2 text-sm text-white/75 [animation-delay:300ms] sm:text-base">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {[
                  [ShieldCheck, "Linha profissional"],
                  [MessageCircle, "Atendimento pelo WhatsApp"]
                ].map(([Icon, label]) => (
                  <span key={String(label)} className="inline-flex items-center gap-1.5">
                    <Icon className="text-red" size={17} aria-hidden="true" /> {String(label)}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="text-red" size={17} aria-hidden="true" /> Marina Verolme · Angra dos Reis
              </span>
            </div>
          </div>

          <HeroWave />
        </section>

        <section id="produtos" className="scroll-mt-20 bg-white pb-20 pt-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Produtos em destaque</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Encontre o produto certo para a sua embarcação.
              </h2>
              <p className="mt-4 text-ink/70">
                Escolha uma categoria, confira alguns produtos e fale diretamente com nossa equipe pelo WhatsApp.
                Tire dúvidas, confirme valores e disponibilidade e receba ajuda para escolher a melhor solução para cada
                etapa do serviço.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <FeaturedCategories groups={featuredGroups} />
            </ScrollReveal>
          </div>
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
