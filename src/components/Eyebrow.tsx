import type { ReactNode } from "react";

/**
 * Rótulo padrão acima dos títulos de seção, com uma pequena barra de acento.
 * - `tone="red"` para fundos claros, `tone="light"` para fundos navy.
 */
export function Eyebrow({
  children,
  tone = "red",
  className = ""
}: {
  children: ReactNode;
  tone?: "red" | "light";
  className?: string;
}) {
  const text = tone === "light" ? "text-white/70" : "text-red";
  const bar = tone === "light" ? "bg-white/40" : "bg-red";
  return (
    <span className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] ${text} ${className}`}>
      <span className={`h-px w-7 ${bar}`} aria-hidden="true" />
      {children}
    </span>
  );
}
