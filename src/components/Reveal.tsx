import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Atraso em ms para escalonar (stagger) itens de um mesmo grid. */
  delay?: number;
  className?: string;
};

/**
 * Wrapper leve para manter a API de stagger sem ocultar conteúdo. O conteúdo
 * fica visível no primeiro paint para evitar blocos vazios em carregamentos
 * lentos ou ambientes sem IntersectionObserver.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} translate-y-0 opacity-100 transition-all duration-[1000ms] ease-nautica`}
    >
      {children}
    </div>
  );
}
