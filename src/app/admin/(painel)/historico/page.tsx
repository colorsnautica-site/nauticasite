import { getRecentChanges } from "@/db/queries/changelog";
import { undoAction } from "./actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { product: "Produto", partner_brand: "Marca", site_content: "Conteúdo do site" };
const ACAO: Record<string, string> = { create: "Criou", update: "Alterou", delete: "Removeu" };

export default async function AdminHistorico() {
  const changes = await getRecentChanges();
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Histórico</h1>
      <div className="mt-6 space-y-2">
        {changes.map((c) => {
          const nome = (c.snapshotAfter as any)?.name ?? (c.snapshotBefore as any)?.name ?? c.entityId;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-ink/80">
                <span className="font-semibold text-navy">{ACAO[c.action] ?? c.action}</span>{" "}
                {LABEL[c.entityType] ?? c.entityType}: <span className="font-medium">{String(nome)}</span>
                <span className="ml-2 text-xs text-ink/50">{new Date(c.changedAt).toLocaleString("pt-BR")}</span>
              </div>
              <form action={undoAction}>
                <input type="hidden" name="logId" value={c.id} />
                <button className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-sky">Desfazer</button>
              </form>
            </div>
          );
        })}
        {changes.length === 0 ? <p className="text-sm text-ink/60">Nenhuma alteração ainda.</p> : null}
      </div>
    </div>
  );
}
