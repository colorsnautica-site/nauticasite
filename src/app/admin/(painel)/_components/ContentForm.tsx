"use client";

import { useActionState } from "react";
import { updateContentAction } from "@/app/admin/(painel)/conteudo/actions";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

const FIELDS = [
  { key: "hero_title", label: "Título do hero" },
  { key: "hero_description", label: "Descrição do hero" },
  { key: "company_name", label: "Nome da empresa" },
  { key: "location", label: "Endereço" },
  { key: "phone", label: "Telefone" },
  { key: "whatsapp_1", label: "WhatsApp 1" },
  { key: "whatsapp_2", label: "WhatsApp 2" },
  { key: "instagram", label: "Instagram" }
] as const;

export function ContentForm({ content }: { content: Record<string, string> }) {
  const [result, action, pending] = useActionState(updateContentAction, INITIAL_ACTION_RESULT);
  return (
    <form action={action} className="max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold text-navy">Conteúdo do site</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <ImageUploader current={content.hero_image} name="hero_image" />
        <div className="mt-4 grid gap-4">
          {FIELDS.map((field) => (
            <label key={field.key} className="text-sm font-semibold text-ink/70">{field.label}
              <input name={field.key} defaultValue={content[field.key] ?? ""} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-ink" />
              <FieldError result={result} name={field.key} />
            </label>
          ))}
        </div>
        <button disabled={pending} className="mt-6 h-11 rounded-full bg-red px-6 font-semibold text-white disabled:opacity-50">
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}
