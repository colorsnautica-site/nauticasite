import { Anchor, ArrowRight, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { HeroWave } from "@/components/HeroWave";
import { StoreExperience } from "@/components/StoreExperience";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";
import { partnerBrands, store } from "@/data/showcase";

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
                <MessageCircle size={18} aria-hidden="true" /> Falar com o atendimento
              </a>
              <a
                href="#produtos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-navy"
              >
                Ver produtos <ArrowRight size={16} aria-hidden="true" />
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

        {/* Estágio fixo (atendimento) + marcas no mesmo pai relativo: a seção
            de marcas (opaca, z-10) sobe POR CIMA das fotos fixadas, sem margem
            negativa — então o fluxo de baixo não quebra. */}
        <div className="relative">
          <StoreExperience supportUrl={supportUrl} />

          <section id="marcas" className="relative z-10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Eyebrow>Marcas parceiras</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy sm:text-4xl">Linhas profissionais em um catálogo único.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {partnerBrands.map((brand, index) => (
                <Reveal key={brand} delay={(index % 6) * 120} className="h-full">
                  <div className="grid h-full place-items-center rounded-lg bg-white p-6 text-center font-heading text-xl font-bold text-navy shadow-sm ring-1 ring-navy/5 transition-all hover:-translate-y-1 hover:text-red hover:shadow-soft">
                    {brand}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          </section>
        </div>

        <section id="contato" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-lg bg-white p-8 shadow-soft">
              <MapPin className="mb-5 text-red" size={34} aria-hidden="true" />
              <Eyebrow>Contato</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy sm:text-4xl">Atendimento na Marina Verolme.</h2>
              <p className="mt-4 text-ink/70">{store.location}</p>
              <p className="mt-2 text-ink/70">Telefone: {store.phone}</p>
              <p className="mt-2 text-ink/70">WhatsApp: {store.whatsappVisible}</p>
              <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright">
                <MessageCircle size={18} aria-hidden="true" /> Chamar no WhatsApp
              </a>
            </div>
            <div className="rounded-lg bg-navy p-8 text-white shadow-soft">
              <Anchor className="mb-5 text-white" size={34} aria-hidden="true" />
              <h2 className="font-heading text-3xl font-extrabold">Perguntas frequentes</h2>
              <div className="mt-6 space-y-5">
                {[
                  ["Os preços são finais?", "Não. São valores demonstrativos e devem ser confirmados com a loja."],
                  ["Como faço o pedido?", "Clique em 'Falar no WhatsApp' no produto e a equipe confirma disponibilidade, valor e condições."],
                  ["A equipe indica o produto correto?", "Sim. Confirme aplicação, disponibilidade e condições diretamente com a equipe."]
                ].map(([question, answer]) => (
                  <div key={question}>
                    <h3 className="font-semibold">{question}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/70">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-navy py-8 text-center text-xs text-white/60">
          <p>© Náutica Color · {store.location}</p>
        </footer>

        <a href={supportUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Náutica Color pelo WhatsApp" className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-red text-white shadow-soft hover:bg-red-bright sm:bottom-6">
          <MessageCircle aria-hidden="true" />
        </a>
      </main>
    </>
  );
}
