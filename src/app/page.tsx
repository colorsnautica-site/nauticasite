import { Anchor, Brush, CheckCircle2, MapPin, MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const { brands, categories, products, settings } = await getCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const supportUrl = whatsappUrl(buildSupportMessage(), resolveWhatsappNumber(settings));

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
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/85 via-navy/55 to-navy/90" />

        <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 lg:px-8">
          <p className="mb-5 inline-flex animate-fade-up rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white">Tudo que seu barco precisa, você encontra aqui.</p>
          <h1 className="mx-auto max-w-2xl animate-fade-up font-heading text-3xl font-extrabold leading-[1.1] [animation-delay:80ms] sm:text-4xl lg:text-5xl">Proteção e performance<br />para sua embarcação.</h1>
          <p className="mx-auto mt-5 max-w-lg animate-fade-up text-sm leading-6 text-white/80 [animation-delay:160ms]">
            Tintas, acabamentos, abrasivos e soluções de alta performance para preservar o valor, a estética e o prestígio do seu barco.
          </p>
          <div className="mt-14 grid w-full gap-8 sm:grid-cols-3">
            {[
              [ShieldCheck, "Proteção de casco", "Antifouling, primers e acabamentos para manutenção náutica."],
              [Brush, "Preparação completa", "Abrasivos, polimento, limpeza e proteção no mesmo carrinho."],
              [PackageCheck, "Compra assistida", "Você seleciona os itens e confirma preço e disponibilidade com a loja."]
            ].map(([Icon, title, text], index) => (
              <div
                key={String(title)}
                className="flex animate-fade-up flex-col items-center px-2"
                style={{ animationDelay: `${240 + index * 80}ms` }}
              >
                <Icon className="mb-3 text-red" size={30} aria-hidden="true" />
                <h2 className="font-heading text-lg font-bold text-white">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">{String(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" id="categorias">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-red">Categorias</p>
              <h2 className="mt-2 font-heading text-4xl font-extrabold text-navy">Linhas para cada etapa da manutenção.</h2>
            </div>
            <Link href="/produtos" className="font-semibold text-navy hover:text-red">Ver catálogo completo</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 200} className="h-full">
                <Link href={`/produtos?categoria=${category.slug}`} className="group block h-full rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white">{index + 1}</span>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-navy group-hover:text-red">{category.name}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold uppercase tracking-[0.2em] text-red">Destaques</p>
          <h2 className="mt-2 font-heading text-4xl font-extrabold text-navy">Produtos de referência para seu carrinho.</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 180} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="marcas" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold uppercase tracking-[0.2em] text-red">Marcas parceiras</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {brands.map((brand, index) => (
              <Reveal key={brand.id} delay={(index % 6) * 120} className="h-full">
                <div className="h-full rounded-lg bg-white p-5 text-center font-heading text-xl font-bold text-navy shadow-sm">
                  {brand.name}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-white/65">Náutica Color</p>
            <h2 className="mt-3 font-heading text-4xl font-extrabold">Mais do que pintura, é sobre preservar valor, estética e prestígio.</h2>
          </div>
          <p className="text-lg leading-8 text-white/75">
            Um catálogo focado em soluções para embarcações, preparado para consulta rápida, montagem do carrinho e atendimento direto pela equipe da loja.
          </p>
        </div>
      </section>

      <section id="como-comprar" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl font-extrabold text-navy">Como comprar pelo WhatsApp</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {["Explore marcas e categorias.", "Adicione produtos ao carrinho.", "Envie a lista pelo WhatsApp.", "Confirme preço, estoque e condições."].map((step, index) => (
              <Reveal key={step} delay={(index % 4) * 180} className="h-full">
                <div className="h-full rounded-lg border border-navy/10 p-5">
                  <CheckCircle2 className="mb-4 text-red" aria-hidden="true" />
                  <p className="font-semibold text-navy">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-soft">
            <MapPin className="mb-5 text-red" size={34} aria-hidden="true" />
            <h2 className="font-heading text-4xl font-extrabold text-navy">Atendimento na Marina Verolme.</h2>
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
