"use client";

import { useActionState } from "react";
import { undoAction } from "@/app/admin/(painel)/historico/actions";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { ActionFeedback } from "./ActionFeedback";

export function UndoButton({ logId, disabled, reason }: { logId: number; disabled: boolean; reason?: string }) {
  const [result, action, pending] = useActionState(undoAction, INITIAL_ACTION_RESULT);
  return (
    <form action={action} className="text-right">
      <input type="hidden" name="logId" value={logId} />
      <button
        disabled={disabled || pending}
        title={reason}
        className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Desfazendo…" : "Desfazer"}
      </button>
      {reason ? <p className="mt-1 max-w-64 text-xs text-ink/50">{reason}</p> : null}
      <ActionFeedback result={result} />
    </form>
  );
}
