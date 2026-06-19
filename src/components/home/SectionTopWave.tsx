/**
 * Onda no topo da seção inferior: espelho vertical da onda do hero (mesma curva
 * `gentle-wave` e mesma animação `wave-move-forever`, por isso permanecem em
 * sincronia). Usa as mesmas cores e tamanho da onda do hero (sky/mist/branco),
 * apenas viradas para baixo, dando a sensação de que a onda do hero "continua"
 * e se completa ao entrar na seção de baixo.
 *
 * É puramente CSS/SVG (sem estado), então pode ser Server Component. O flip
 * vertical (`-scale-y-100`) coloca o cheio em cima e as cristas apontando para
 * baixo. A fase (offsets x) acompanha a da onda do hero para encaixar.
 */
export function SectionTopWave() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
    >
      <svg
        viewBox="0 4 120 48"
        preserveAspectRatio="none"
        className="block h-12 w-full -scale-y-100 sm:h-16"
      >
        <defs>
          <path
            id="gentle-wave-down"
            d="M-240 24 c15 0 30 -16 60 -16 s30 32 60 32 s30 -32 60 -32 s30 32 60 32 s30 -32 60 -32 s30 32 60 32 s30 -32 60 -32 s30 32 60 32 v44 h-480 z"
          />
        </defs>
        <g className="hero-waves">
          <use href="#gentle-wave-down" x="0" y="0" fill="#E8F0FA" fillOpacity="0.2" />
          <use href="#gentle-wave-down" x="45" y="3" fill="#D7E5F4" fillOpacity="0.5" />
          <use href="#gentle-wave-down" x="25" y="6" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
