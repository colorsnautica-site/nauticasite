"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/data/catalog";

type CategoryTabsProps =
  | { mode: "state"; categories: Category[]; activeSlug: string; onSelect: (slug: string) => void }
  | { mode: "links"; categories: Category[] };

const TAB_BASE =
  "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition";
const TAB_ACTIVE = "bg-navy text-white";
const TAB_INACTIVE = "bg-white text-navy/70 ring-1 ring-navy/10 hover:text-navy";

/**
 * Abas de categoria em dois modos: "state" troca a categoria ativa via
 * callback (usado na prévia da landing, sem navegação); "links" navega para
 * /produtos/[categoria] e destaca a rota atual via usePathname (usado nas
 * páginas de catálogo).
 */
export function CategoryTabs(props: CategoryTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias de produtos">
      {props.categories.map((category) => {
        if (props.mode === "state") {
          const active = category.slug === props.activeSlug;
          return (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => props.onSelect(category.slug)}
              className={`${TAB_BASE} ${active ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              {category.name}
            </button>
          );
        }

        const active = pathname === `/produtos/${category.slug}`;
        return (
          <Link
            key={category.slug}
            href={`/produtos/${category.slug}`}
            role="tab"
            aria-selected={active}
            className={`${TAB_BASE} ${active ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
