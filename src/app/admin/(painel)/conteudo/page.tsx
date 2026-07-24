import { getSiteContent } from "@/db/queries/content";
import { updateContentAction } from "./actions";
import { ImageUploader } from "@/app/admin/(painel)/_components/ImageUploader";

export const dynamic = "force-dynamic";

const CAMPOS: { key: string; label: string }[] = [
  { key: "hero_title", label: "Título do hero" },
  { key: "hero_description", label: "Descrição do hero" },
  { key: "company_name", label: "Nome da empresa" },
  { key: "location", label: "Endereço" },
  { key: "phone", label: "Telefone" },
  { key: "whatsapp_1", label: "WhatsApp 1" },
  { key: "whatsapp_2", label: "WhatsApp 2" },
  { key: "instagram", label: "Instagram" }
];

export default async function AdminConteudo() {
  const c = await getSiteContent();
  return (
    <form action={updateContentAction} className="max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold text-navy">Conteúdo do site</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <ImageUploader current={c.hero_image} name="hero_image" />
        <div className="mt-4 grid gap-4">
          {CAMPOS.map((f) => (
            <label key={f.key} className="text-sm font-semibold text-ink/70">{f.label}
              <input name={f.key} defaultValue={c[f.key] ?? ""} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-ink" />
            </label>
          ))}
        </div>
        <button className="mt-6 h-11 rounded-full bg-red px-6 font-semibold text-white">Salvar</button>
      </div>
    </form>
  );
}
