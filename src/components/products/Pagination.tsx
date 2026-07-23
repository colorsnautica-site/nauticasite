import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Constroi a lista de paginas exibidas: primeira, ultima, vizinhas da atual e
// "..." nos vazios -- evita listar dezenas de numeros quando ha muitas paginas
// (ex.: Ferramentas com 26 paginas).
function buildPageList(current: number, total: number): (number | "dots")[] {
  const siblingCount = 1;
  const totalNumbers = siblingCount * 2 + 5;

  if (totalNumbers >= total) return range(1, total);

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblingCount * 2), "dots", total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, "dots", ...range(total - (3 + siblingCount * 2) + 1, total)];
  }
  return [1, "dots", ...range(leftSibling, rightSibling), "dots", total];
}

export function Pagination({
  basePath,
  page,
  totalPages
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pageHref = (target: number) => (target === 1 ? basePath : `${basePath}?page=${target}`);
  const pages = buildPageList(page, totalPages);

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={pageHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        aria-label="Página anterior"
        className={`grid h-10 w-10 place-items-center rounded-full text-navy transition ${
          page === 1 ? "pointer-events-none opacity-30" : "hover:bg-sky"
        }`}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </Link>
      {pages.map((p, index) =>
        p === "dots" ? (
          <span key={`dots-${index}`} className="grid h-10 w-10 place-items-center text-sm text-ink/40">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition ${
              p === page ? "bg-navy text-white" : "text-navy/70 hover:bg-sky"
            }`}
          >
            {p}
          </Link>
        )
      )}
      <Link
        href={pageHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        aria-label="Próxima página"
        className={`grid h-10 w-10 place-items-center rounded-full text-navy transition ${
          page === totalPages ? "pointer-events-none opacity-30" : "hover:bg-sky"
        }`}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </nav>
  );
}
