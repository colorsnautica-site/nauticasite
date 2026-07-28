import type { ZodError } from "zod";

export type ActionResult = {
  status: "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_ACTION_RESULT: ActionResult = { status: "success", message: "" };

export class PublicActionError extends Error {}

export function validationResult(error: ZodError): ActionResult {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    fieldErrors: error.flatten().fieldErrors as Record<string, string[]>
  };
}

export function actionErrorResult(error: unknown): ActionResult {
  if (error instanceof PublicActionError) {
    return { status: "error", message: error.message };
  }
  console.error("Falha em ação administrativa", error);
  return { status: "error", message: "Não foi possível concluir a operação. Tente novamente." };
}
