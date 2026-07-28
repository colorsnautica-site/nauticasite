"use client";

import type { ActionResult } from "@/lib/action-result";

export function ActionFeedback({ result }: { result: ActionResult }) {
  if (!result.message) return null;
  return (
    <p
      role={result.status === "error" ? "alert" : "status"}
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${
        result.status === "error" ? "bg-red/10 text-red" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {result.message}
    </p>
  );
}

export function FieldError({ result, name }: { result: ActionResult; name: string }) {
  const message = result.fieldErrors?.[name]?.[0];
  return message ? <span className="mt-1 block text-xs font-normal text-red">{message}</span> : null;
}
