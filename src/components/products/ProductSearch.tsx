"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ProductSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="product-search-form"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/35 focus-visible:ring-offset-2"
      >
        <Search size={16} aria-hidden="true" />
        Buscar produtos
      </button>

      {open ? (
        <form
          id="product-search-form"
          action="/produtos"
          method="get"
          role="search"
          className="absolute right-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-navy/10 bg-white p-3 shadow-soft"
        >
          <label htmlFor="product-search" className="sr-only">Buscar por nome, código ou marca</label>
          <div className="flex items-center gap-2 rounded-full border border-navy/15 bg-white p-1.5 pl-4 focus-within:border-navy/35 focus-within:ring-4 focus-within:ring-navy/5">
            <Search size={16} className="shrink-0 text-navy/45" aria-hidden="true" />
            <input
              ref={inputRef}
              id="product-search"
              name="q"
              type="search"
              defaultValue={initialQuery}
              placeholder="Nome, código ou marca"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
            />
            <button className="h-9 rounded-full bg-red px-4 text-xs font-semibold text-white transition hover:bg-red-bright">
              Buscar
            </button>
          </div>
          {initialQuery ? (
            <Link
              href="/produtos"
              className="mt-2 inline-flex items-center gap-1 px-2 text-xs font-semibold text-navy/60 transition hover:text-red"
            >
              <X size={13} aria-hidden="true" /> Limpar busca
            </Link>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
