"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import type { Category } from "@/types/catalog";

/**
 * Busca central do hero. Envia o termo para o catálogo (/produtos?q=...) e
 * oferece atalhos de categoria reais do catálogo logo abaixo, no estilo loja.
 */
export function HeroSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [term, setTerm] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = term.trim();
    router.push(value ? `/produtos?q=${encodeURIComponent(value)}` : "/produtos");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/95 p-2 shadow-soft backdrop-blur"
        role="search"
      >
        <Search className="ml-3 shrink-0 text-navy/50" size={20} aria-hidden="true" />
        <label className="sr-only" htmlFor="hero-search">
          Buscar produto, marca ou aplicação
        </label>
        <input
          id="hero-search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar tinta, antifouling, verniz, lixa..."
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/45 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright"
        >
          Buscar <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Atalhos</span>
        {categories.slice(0, 5).map((category) => (
          <Link
            key={category.id}
            href={`/produtos?categoria=${category.slug}`}
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white hover:text-navy"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
