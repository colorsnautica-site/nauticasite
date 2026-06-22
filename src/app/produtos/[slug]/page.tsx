import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, ClipboardList, Info, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { ProductActionPanel } from "@/components/cart/ProductActionPanel";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { formatPriceLabel, isOnRequestPrice } from "@/lib/currency";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { getProductBySlug } from "@/lib/catalog/get-product-by-slug";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | Náutica Color` : "Produto | Náutica Color",
    description: product?.shortDescription
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products, settings } = await getCatalog();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const related = products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId === product.categoryId || (Boolean(product.brandId) && item.brandId === product.brandId))
    )
    .slice(0, 4);
  const stockLabel = product.stockStatus === "available" ? "Disponível" : product.stockStatus === "unavailable" ? "Indisponível" : "Sob consulta";
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Aplicação orientada",
      text: "Confirme superfície, preparo e compatibilidade antes da compra."
    },
    {
      icon: ClipboardList,
      title: "Orçamento assistido",
      text: "Adicione ao carrinho e envie a lista para revisão pelo WhatsApp."
    },
    {
      icon: Sparkles,
      title: "Linha profissional",
      text: "Produto selecionado para manutenção, proteção e acabamento náutico."
    }
  ];
  const quickSpecs = [
    ["Marca", product.brand?.name ?? "Náutica Color"],
    ["Categoria", product.category?.name ?? "Produto náutico"],
    ["Unidade", product.unit],
    ["SKU", product.sku],
    ["Status", stockLabel],
    ["Preço", product.demoPrice ? "Referência para orçamento" : "Confirmar com a loja"]
  ];
  const usageSteps = [
    "Informe o tipo de embarcação, superfície e etapa do serviço.",
    "Confirme preparação, rendimento, compatibilidade e diluição quando aplicável.",
    "Valide preço, estoque e prazo com a equipe antes da retirada ou entrega."
  ];

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <Link href="/" className="hover:text-red">Início</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <Link href="/produtos" className="hover:text-red">Produtos</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-sky p-8 shadow-soft">
            <ProductImage src={product.imageUrl} alt={product.name} loading="eager" className="mx-auto h-[420px] w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              {product.brand?.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={product.brand.logoUrl} alt={product.brand.name} className="h-7 w-auto max-w-[120px] object-contain" />
              ) : null}
              <p className="font-bold uppercase tracking-[0.2em] text-red">{product.brand?.name}</p>
            </div>
            <h1 className="mt-3 font-heading text-5xl font-extrabold leading-tight text-navy">{product.name}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy">{product.category?.name}</span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy">{product.unit}</span>
              <span className="rounded-full bg-red/10 px-4 py-2 text-sm font-semibold text-red">
                {isOnRequestPrice(product.priceCents) ? "Preço sob consulta" : "Preço de referência"}
              </span>
            </div>
            <p className="mt-7 font-heading text-4xl font-extrabold text-ink">{formatPriceLabel(product.priceCents)}</p>
            <p className="mt-3 text-sm font-semibold text-red">
              {isOnRequestPrice(product.priceCents)
                ? "Fale com a equipe para confirmar preço e disponibilidade deste item."
                : "Valores de referência sujeitos à confirmação de preço e disponibilidade."}
            </p>
            <p className="mt-6 text-lg leading-8 text-ink/75">{product.description || product.shortDescription}</p>
            <p className="mt-4 rounded-lg bg-white p-4 text-sm font-semibold text-navy shadow-sm">
              Confirme disponibilidade, especificações e aplicação correta com nossa equipe.
            </p>
            <div className="mt-8">
              <ProductActionPanel product={product} settings={settings} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Reveal key={benefit.title} delay={index * 140} className="h-full">
                <div className="h-full rounded-lg border border-navy/10 p-6">
                  <Icon className="mb-4 text-red" size={30} aria-hidden="true" />
                  <h2 className="font-heading text-xl font-bold text-navy">{benefit.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{benefit.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <Reveal className="h-full">
            <div className="h-full rounded-lg bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Info className="text-red" size={28} aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red">Detalhes técnicos</p>
                  <h2 className="font-heading text-3xl font-extrabold text-navy">Resumo para consulta rápida</h2>
                </div>
              </div>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {quickSpecs.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-off-white p-4">
                    <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">{label}</dt>
                    <dd className="mt-1 font-semibold text-navy">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={140} className="h-full">
            <div className="h-full rounded-lg bg-navy p-8 text-white shadow-soft">
              <Wrench className="mb-5 text-red" size={30} aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Como confirmar</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold">Antes de aplicar, valide com a equipe.</h2>
              <ol className="mt-6 space-y-4">
                {usageSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-white/75">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-navy">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["O preço é final?", "Não. O valor é demonstrativo e precisa ser confirmado com a loja."],
              ["Posso comprar direto pelo site?", "O carrinho monta a lista e envia a solicitação pelo WhatsApp."],
              ["A equipe indica o produto certo?", "Sim. A indicação considera superfície, aplicação e disponibilidade."]
            ].map(([question, answer], index) => (
              <Reveal key={question} delay={index * 140} className="h-full">
                <div className="h-full rounded-lg border border-navy/10 p-6">
                  <CheckCircle2 className="mb-4 text-red" aria-hidden="true" />
                  <h2 className="font-heading text-xl font-bold text-navy">{question}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold text-navy">Produtos relacionados</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 180} className="h-full">
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
