"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, MessageCircle, Phone, ShoppingBasket, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";

const nav = [
  { href: "/produtos", label: "Produtos" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#marcas", label: "Marcas" },
  { href: "/#atendimento", label: "Atendimento" },
  { href: "/#contato", label: "Contato" }
];

export function Header({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false);
  const { count, openCart } = useCart();
  const reduce = useReducedMotion();

  return (
    <>
      <div className="bg-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 text-xs sm:px-6 lg:px-8">
          <span>Marina Verolme, Angra dos Reis - RJ</span>
          <span className="hidden items-center gap-2 sm:flex">
            <Phone size={14} aria-hidden="true" /> {phone || "(24) 2404-4606"}
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Náutica Color">
            <img src="/brand/nautica-color-logo.png" alt="Náutica Color" className="h-10 w-auto" />
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex" aria-label="Menu principal">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap text-xs font-semibold text-navy hover:text-red">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/#atendimento"
              className="hidden h-11 items-center justify-center gap-2 rounded-full bg-off-white px-5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white md:inline-flex"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Orçamento
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-navy text-white hover:bg-navy-light"
              aria-label="Abrir carrinho de compras"
            >
              <ShoppingBasket size={19} aria-hidden="true" />
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={reduce ? false : { scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 16 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-xs"
                >
                  {count}
                </motion.span>
              ) : null}
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-navy hover:bg-off-white md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.nav
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-navy/10 bg-white md:hidden"
              aria-label="Menu mobile"
            >
              <div className="px-4 py-4">
                <Link href="/" onClick={() => setOpen(false)} className="mb-2 block rounded-lg bg-off-white px-3 py-3 text-center text-xs font-semibold text-navy hover:bg-navy hover:text-white">
                  Início
                </Link>
                {nav.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.06 + index * 0.05 }}
                  >
                    <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-center text-xs font-semibold text-navy hover:bg-off-white">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
        {/* Onda na base do header viajando para a esquerda (loop tileável) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full overflow-hidden">
          <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="h-3 w-[200%] animate-wave-slow sm:h-4">
            <path fill="#ffffff" d="M0,70 C360,20 1080,120 1440,70 C1800,20 2520,120 2880,70 L2880,0 L0,0 Z" />
          </svg>
        </div>
      </header>
    </>
  );
}
