"use client";

import { useEffect, useRef } from "react";

/**
 * Trava de scroll do body, foco inicial e trap de Tab, e fechamento por ESC -
 * comportamento comum a qualquer dialog modal, independente do estilo visual.
 * Usado pelo Modal.tsx (site publico) e pelos modais proprios do painel admin
 * (formularios mais largos, que nao cabem no layout do Modal.tsx).
 */
export function useDialogBehavior<T extends HTMLElement = HTMLElement>(onRequestClose: () => void) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onRequestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { closeButtonRef, containerRef };
}
