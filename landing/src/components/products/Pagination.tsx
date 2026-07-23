import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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
      {pages.map((p) => (
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
      ))}
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
