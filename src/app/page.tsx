import {
  Anchor,
  ArrowRight,
  Brush,
  Droplets,
  Layers,
  MapPin,
  MessageCircle,
  PaintBucket,
  ShieldCheck,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { FeaturedCarousel } from "@/components/products/FeaturedCarousel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { productPhotos } from "@/lib/catalog/product-photos";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const { brands, categories, products, settings } = await getCatalog();
  // Produtos com foto real (vinda do catálogo, via productPhotos) ficam como
  // estão. Os demais recebem fotos APENAS DEMONSTRATIVAS distribuídas por índice.
  const examplePhotos = [
    "/products/examples/weg-tinta-galao.png",
    "/products/examples/3m-finesse-it-polish.png",
    "/products/examples/weg-diluente.png",
    "/products/examples/sikaflex-295-uv.png"
  ];
  const featured = products
    .filter((product) => product.featured)
    .slice(0, 8)
    .map((product, index) => ({
      ...product,
      imageUrl: productPhotos[product.slug] ?? examplePhotos[index % examplePhotos.length]
    }));
  const supportUrl = whatsappUrl(buildSupportMessage(), resolveWhatsappNumber(settings));
  // Identidade visual por categoria (ícone + descrição), com fallback seguro
  // para slugs que não estiverem mapeados.
  const categoryMeta: Record<string, { icon: LucideIcon; blurb: string }> = {
    "tintas-de-fundo-e-primers": { icon: PaintBucket, blurb: "Primers e tintas de fundo para aderência e proteção da base." },
    antifouling: { icon: ShieldCheck, blurb: "Revestimentos anti-incrustantes para a obra viva do casco." },
    "vernizes-e-acabamentos": { icon: Brush, blurb: "Vernizes e tintas de acabamento para brilho e proteção externa." },
    "lixas-e-abrasivos": { icon: Wrench, blurb: "Lixas, discos e abrasivos para preparar a superfície." },
    "fiberglass-e-compositos": { icon: Layers, blurb: "Gelcoat, resinas e tecidos para reparos em fibra." },
    "limpeza-protecao-e-polimento": { icon: Droplets, blurb: "Massas, boinas e produtos para corte, brilho e proteção." }
  };

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        {/*
          Foto de fundo do hero (full-bleed).
          TODO(admin): a imagem será gerenciada pelo futuro painel administrativo,
          via a configuração `hero_image_url` (store_settings). Enquanto o admin não
          existir, cai na foto local da fachada e, na falta dela, no fundo navy.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-navy bg-cover bg-center"
          style={{ backgroundImage: `url('${settings.hero_image_url || "/hero/fachada-nautica.png"}')` }}
        />
        {/* Overlay para legibilidade do texto sobre a foto */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy/95 via-navy/70 to-navy-light/55" />
        {/* Brilho náutico sutil para dar profundidade */}
        <div aria-hidden="true" className="absolute -right-24 top-4 -z-10 h-80 w-80 rounded-full bg-red/20 blur-3xl" />

        <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-8 px-4 pb-28 pt-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 inline-flex animate-fade-up items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-red">
              <Anchor size={14} aria-hidden="true" /> Náutica Color
            </p>
            <h1 className="animate-fade-up font-heading text-3xl font-extrabold leading-[1.1] [animation-delay:80ms] sm:text-4xl lg:text-5xl">
              Tudo para a manutenção da sua embarcação.
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-fade-up text-base leading-7 text-white/80 [animation-delay:160ms]">
              Tintas, antifouling, acabamentos e abrasivos de alta performance. Encontre o produto certo e monte seu orçamento em minutos.
            </p>
          </div>

          <div className="w-full max-w-2xl animate-fade-up [animation-delay:220ms]">
            <HeroSearch categories={categories} />
          </div>

          <div className="flex animate-fade-up flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-white/75 [animation-delay:300ms]">
            {[
              [ShieldCheck, "Linha profissional"],
              [MessageCircle, "Orçamento pelo WhatsApp"],
              [MapPin, "Marina Verolme · Angra dos Reis"]
            ].map(([Icon, label]) => (
              <span key={String(label)} className="inline-flex items-center gap-2">
                <Icon className="text-red" size={18} aria-hidden="true" /> {String(label)}
              </span>
            ))}
          </div>
        </div>

        {/* Onda náutica viajando para a esquerda (loop tileável) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
          <div className="animate-wave-bob">
            <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="block h-16 w-[200%] animate-wave sm:h-24">
              <path fill="#ffffff" d="M0,50 C360,100 1080,0 1440,50 C1800,100 2520,0 2880,50 L2880,120 L0,120 Z" />
            </svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-white" />
        </div>
      </section>

      <section className="py-20" id="categorias">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Categorias</Eyebrow>
            </div>
            <Link href="/produtos" className="inline-flex items-center gap-2 font-semibold text-navy transition hover:text-red">
              Ver catálogo completo <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const meta = categoryMeta[category.slug];
              const Icon = meta?.icon ?? Anchor;
              return (
                <Reveal key={category.id} delay={(index % 3) * 200} className="h-full">
                  <Link href={`/produtos?categoria=${category.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white p-4 shadow-sm ring-1 ring-navy/5 transition-all hover:-translate-y-1 hover:shadow-soft hover:ring-red/20">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-red transition-transform duration-300 ease-nautica group-hover:scale-x-100" />
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 font-heading text-base font-bold text-navy group-hover:text-red">{category.name}</h3>
                    <p className="mt-1.5 flex-1 text-xs leading-5 text-ink/65">
                      {meta?.blurb ?? "Ver produtos, marcas e opções disponíveis para essa linha."}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red">
                      Explorar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Destaques</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Produtos de referência para seu carrinho.</h2>
              <p className="mt-4 text-ink/70">
                Itens selecionados para começar o orçamento e acelerar a conversa com a equipe.
              </p>
            </div>
            <Link href="/produtos" className="inline-flex items-center gap-2 font-semibold text-navy transition hover:text-red">
              Ver todos os produtos <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10">
            <FeaturedCarousel products={featured} />
          </div>
        </div>
      </section>

      <section id="atendimento" className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Atendimento</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Prontos para te atender.</h2>
              <p className="mt-4 text-ink/70">
                Nossa loja na Marina Verolme tem estoque completo e equipe especializada para indicar o produto certo para o seu casco. Passe na loja ou chame a gente pelo WhatsApp.
              </p>
            </div>
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-bright">
              <MessageCircle size={18} aria-hidden="true" /> Falar com um especialista
            </a>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                src: "/atendimento/atendimento-1.jpg",
                title: "Estoque completo",
                text: "Tintas, antifouling e abrasivos prontos para retirada.",
                alt: "Corredor da loja Náutica Color com prateleiras de tintas e produtos náuticos"
              },
              {
                src: "/atendimento/atendimento-2.jpg",
                title: "Atendimento na loja",
                text: "Equipe especializada para tirar suas dúvidas técnicas.",
                alt: "Balcão de atendimento da Náutica Color com display Marine Shop"
              },
              {
                src: "/atendimento/atendimento-3.jpg",
                title: "As melhores marcas",
                text: "Linhas profissionais reunidas em um só lugar.",
                alt: "Prateleiras da Náutica Color com diversas marcas de produtos náuticos"
              }
            ].map((item, index) => (
              <Reveal key={item.src} delay={(index % 3) * 160} className="h-full">
                <figure className="group relative h-full overflow-hidden rounded-lg shadow-soft ring-1 ring-navy/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-nautica group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/80">{item.text}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="marcas" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>Marcas parceiras</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy sm:text-4xl">Linhas profissionais em um catálogo único.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {brands.map((brand, index) => (
              <Reveal key={brand.id} delay={(index % 6) * 120} className="h-full">
                <div className="grid h-full place-items-center rounded-lg bg-white p-6 text-center font-heading text-xl font-bold text-navy shadow-sm ring-1 ring-navy/5 transition-all hover:-translate-y-1 hover:text-red hover:shadow-soft">
                  {brand.name}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-soft">
            <MapPin className="mb-5 text-red" size={34} aria-hidden="true" />
            <Eyebrow>Contato</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy sm:text-4xl">Atendimento na Marina Verolme.</h2>
            <p className="mt-4 text-ink/70">{settings.location}</p>
            <p className="mt-2 text-ink/70">Telefone: {settings.phone}</p>
            <p className="mt-2 text-ink/70">WhatsApp: {settings.whatsapp_visible}</p>
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-bright">
              <MessageCircle size={18} aria-hidden="true" /> Chamar no WhatsApp
            </a>
          </div>
          <div className="rounded-lg bg-navy p-8 text-white shadow-soft">
            <Anchor className="mb-5 text-white" size={34} aria-hidden="true" />
            <h2 className="font-heading text-3xl font-extrabold">Perguntas frequentes</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Os preços são finais?", "Não. São valores demonstrativos e devem ser confirmados com a loja."],
                ["O site vende online?", "O carrinho reúne os produtos e envia a lista para atendimento via WhatsApp."],
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

      <a href={supportUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Náutica Color pelo WhatsApp" className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-red text-white shadow-soft hover:bg-red-bright sm:bottom-6">
        <MessageCircle aria-hidden="true" />
      </a>
    </main>
  );
}
