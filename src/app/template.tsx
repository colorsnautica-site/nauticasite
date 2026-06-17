/**
 * Transição de página: cada navegação re-monta este template e o conteúdo
 * entra com um fade + slide-up sutil via CSS (classe .page-enter).
 *
 * Usamos CSS em vez de motion de propósito: a animação CSS roda já no
 * primeiro paint, sem esperar a hidratação — evitando o flash de página
 * invisível que aconteceria com `initial opacity:0` renderizado no SSR.
 * Por ser CSS puro, pode ser um server component. O prefers-reduced-motion
 * já é neutralizado no globals.css.
 *
 * Envolve apenas o conteúdo da página (Header sticky e CartDrawer fixed
 * ficam no AppShell, fora daqui).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
