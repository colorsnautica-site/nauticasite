import {
  Anchor,
  ArrowRight,
  Brush,
  ClipboardCheck,
  Droplets,
  LifeBuoy,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { ProductCard } from "@/components/products/ProductCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const { brands, categories, products, settings } = await getCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const supportUrl = whatsappUrl(buildSupportMessage(), resolveWhatsappNumber(settings));
  const categoryPreview = categories.slice(0, 5);
  const solutionGuides = [
    {
      icon: ShieldCheck,
      title: "Proteção de casco",
      text: "Antifouling, primers e revestimentos para reduzir incrustação e proteger a obra viva.",
      href: "/produtos?categoria=antifouling"
    },
    {
      icon: Brush,
      title: "Pintura e acabamento",
      text: "Tintas, vernizes e complementos para acabamento externo, brilho e manutenção estética.",
      href: "/produtos?categoria=vernizes-e-acabamentos"
    },
    {
      icon: Wrench,
      title: "Preparo de superfície",
      text: "Lixas, abrasivos e produtos para deixar a superfície pronta antes da aplicação.",
      href: "/produtos?categoria=lixas-e-abrasivos"
    },
    {
      icon: Droplets,
      title: "Limpeza e polimento",
      text: "Produtos para corte, brilho, proteção e manutenção depois do uso.",
      href: "/produtos?categoria=limpeza-protecao-e-polimento"
    },
    {
      icon: Sparkles,
      title: "Fibra e reparos",
      text: "Gelcoat, resinas e reforços para pequenos reparos e trabalhos em compósitos.",
      href: "/produtos?categoria=fiberglass-e-compositos"
    },
    {
      icon: LifeBuoy,
      title: "Compra assistida",
      text: "Monte uma lista e confirme aplicação, preço e disponibilidade com a equipe.",
      href: "/#como-comprar"
    }
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        {/*
          Foto de fundo do hero (full-bleed).
          TODO(admin): a imagem será gerenciada pelo futuro painel administrativo,
          via a configuração `hero_image_url` (store_settings). Enquanto o admin não
          existir, cai no arquivo local /hero/hero.jpg e, na falta dele, no fundo navy.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-navy bg-cover bg-center"
          style={{ backgroundImage: `url('${settings.hero_image_url || "/hero/hero.jpg"}')` }}
        />
        {/* Overlay para legibilidade do texto sobre a foto */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy/95 via-navy/70 to-navy-light/55" />
        {/* Brilho náutico sutil para dar profundidade */}
        <div aria-hidden="true" className="absolute -right-24 top-4 -z-10 h-80 w-80 rounded-full bg-red/20 blur-3xl" />

        <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-8 px-4 pb-28 pt-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
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

        {/* Divisor de onda náutico para o conteúdo branco abaixo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-10 w-full sm:h-16">
            <path fill="#ffffff" d="M0,72 C240,120 480,24 720,48 C960,72 1200,128 1440,80 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-white py-6" aria-label="Categorias principais">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <Eyebrow className="shrink-0">Comprar por categoria</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {categoryPreview.map((category) => (
              <Link key={category.id} href={`/produtos?categoria=${category.slug}`} className="rounded-full bg-sky px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white">
                {category.name}
              </Link>
            ))}
            <Link href="/produtos" className="rounded-full bg-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-bright">
              Ver tudo
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20" id="categorias">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Categorias</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Linhas para cada etapa da manutenção.</h2>
              <p className="mt-4 text-ink/70">
                A navegação foi pensada para quem precisa encontrar rápido o produto certo para casco, acabamento, reparo ou polimento.
              </p>
            </div>
            <Link href="/produtos" className="inline-flex items-center gap-2 font-semibold text-navy transition hover:text-red">
              Ver catálogo completo <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 200} className="h-full">
                <Link href={`/produtos?categoria=${category.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white p-7 shadow-sm ring-1 ring-navy/5 transition-all hover:-translate-y-1 hover:shadow-soft hover:ring-red/20">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-red transition-transform duration-300 ease-nautica group-hover:scale-x-100" />
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-navy font-heading text-lg font-bold text-white transition-colors group-hover:bg-red">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-navy group-hover:text-red">{category.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-ink/65">
                    Ver produtos, marcas e opções disponíveis para essa linha.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red">
                    Explorar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-navy py-20 text-white">
        <div aria-hidden="true" className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-red/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow tone="light">Guias rápidos</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Encontre pela aplicação, não só pelo nome do produto.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutionGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <Reveal key={guide.title} delay={(index % 3) * 160} className="h-full">
                  <Link href={guide.href} className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/10 p-6 transition hover:-translate-y-1 hover:bg-white hover:text-navy">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-red/10">
                      <Icon className="text-red" size={26} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-heading text-xl font-bold">{guide.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-white/70 group-hover:text-ink/70">{guide.text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-red">
                      Ver soluções <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 180} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal className="h-full">
            <div className="h-full rounded-lg bg-white p-8 shadow-soft">
              <ClipboardCheck className="mb-5 text-red" size={34} aria-hidden="true" />
              <Eyebrow>Compra assistida</Eyebrow>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">O site ajuda a montar a lista. A equipe confirma o produto certo.</h2>
              <p className="mt-4 text-ink/70">
                Produtos náuticos dependem de superfície, aplicação, rendimento, preparação e disponibilidade. Por isso o carrinho vira uma solicitação de orçamento pelo WhatsApp.
              </p>
              <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-bright">
                <MessageCircle size={18} aria-hidden="true" /> Pedir indicação
              </a>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Escolha por etapa", "Comece por casco, acabamento, reparo, preparo ou polimento."],
              ["Monte o carrinho", "Adicione os itens de interesse sem compromisso de checkout."],
              ["Envie pelo WhatsApp", "A lista chega pronta para a equipe revisar com você."],
              ["Confirme aplicação", "Preço, estoque, rendimento e compatibilidade são validados antes da compra."]
            ].map(([title, text], index) => (
              <Reveal key={title} delay={(index % 2) * 160} className="h-full">
                <div className="h-full rounded-lg border border-navy/10 bg-white p-6 transition-shadow hover:shadow-soft">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sky font-heading text-sm font-bold text-navy">{index + 1}</span>
                  <h3 className="mt-4 font-heading text-xl font-bold text-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
                </div>
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

      <section className="relative isolate overflow-hidden bg-navy py-20 text-white">
        <div aria-hidden="true" className="absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-red/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow tone="light">Náutica Color</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Mais do que pintura, é sobre preservar valor, estética e prestígio.</h2>
          </div>
          <p className="text-lg leading-8 text-white/75">
            Um catálogo focado em soluções para embarcações, preparado para consulta rápida, montagem do carrinho e atendimento direto pela equipe da loja.
          </p>
        </div>
      </section>

      <section id="como-comprar" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>Passo a passo</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy sm:text-4xl">Como comprar pelo WhatsApp</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {["Explore marcas e categorias.", "Adicione produtos ao carrinho.", "Envie a lista pelo WhatsApp.", "Confirme preço, estoque e condições."].map((step, index) => (
              <Reveal key={step} delay={(index % 4) * 180} className="h-full">
                <div className="relative h-full rounded-lg border border-navy/10 p-6 transition-shadow hover:shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-heading text-base font-bold text-white">{index + 1}</span>
                  <p className="mt-4 font-semibold text-navy">{step}</p>
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
