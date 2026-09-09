"use client";

import React, { useCallback, useRef } from "react";

type Props = {
  formId?: string; // id do form; se não fornecido, usa o form mais próximo
  className?: string;
  children?: React.ReactNode;
};

export default function MobileLoginButton({ formId, className = "", children }: Props) {
  const locked = useRef(false);

  const submitForm = useCallback((e?: Event | React.SyntheticEvent) => {
    if (e && typeof (e as any).preventDefault === "function") {
      (e as any).preventDefault();
    }
    if (locked.current) return;
    locked.current = true;

    let form: HTMLFormElement | null = null;
    if (formId) {
      form = document.getElementById(formId) as HTMLFormElement | null;
    }

    if (!form) {
      // tenta achar o form mais próximo com action contendo /admin
      form = document.querySelector("form[action*='/admin']") as HTMLFormElement | null;
    }

    if (form) {
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.submit();
    } else {
      console.warn("MobileLoginButton: formulário não encontrado (formId:", formId, ")");
    }

    setTimeout(() => {
      locked.current = false;
    }, 700);
  }, [formId]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <button
      type="button"
      onPointerDown={(e) => {
        submitForm(e);
      }}
      onClick={(e) => {
        submitForm(e);
      }}
      className={className}
      aria-label="Entrar"
    >
      {children ?? "Entrar"}
    </button>
  );
}
