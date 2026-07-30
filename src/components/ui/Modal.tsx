"use client";

import { createPortal } from "react-dom";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Mesma curva usada nas outras animações do site (tailwind.config.ts: transitionTimingFunction.nautica).
const NAUTICA_EASE = [0.16, 1, 0.3, 1] as const;

const ModalCloseContext = createContext<(() => void) | null>(null);

// Permite que conteúdo dentro do Modal (ex: um botão "Continuar comprando")
// dispare o mesmo fechamento animado que o X, o ESC e o clique fora usam,
// em vez de desmontar o Modal na marra chamando onClose diretamente.
export function useRequestModalClose() {
  const requestClose = useContext(ModalCloseContext);
  if (!requestClose) throw new Error("useRequestModalClose precisa ser usado dentro de <Modal>");
  return requestClose;
}

export function Modal({
  onClose,
  children,
  labelledBy
}: {
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const requestClose = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
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
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#343342]/60 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: NAUTICA_EASE }}
      onAnimationComplete={() => {
        if (!open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: NAUTICA_EASE }}
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={requestClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-navy/5 text-lg text-navy transition hover:bg-navy/10"
        >
          ×
        </button>
        <ModalCloseContext.Provider value={requestClose}>{children}</ModalCloseContext.Provider>
      </motion.div>
    </motion.div>,
    document.body
  );
}
