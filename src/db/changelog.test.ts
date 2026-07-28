import { describe, expect, it } from "vitest";
import { computeUndo, getUndoEligibility, snapshotsEqual } from "./changelog";

describe("computeUndo", () => {
  it("mapeia update, delete e create", () => {
    expect(computeUndo({ action: "update", snapshotBefore: { name: "A" }, snapshotAfter: { name: "B" } }))
      .toEqual({ op: "restore", data: { name: "A" } });
    expect(computeUndo({ action: "delete", snapshotBefore: { id: 1 }, snapshotAfter: null }))
      .toEqual({ op: "recreate", data: { id: 1 } });
    expect(computeUndo({ action: "create", snapshotBefore: null, snapshotAfter: { id: 2 } }))
      .toEqual({ op: "delete", data: { id: 2 } });
  });
});

describe("snapshotsEqual", () => {
  it("normaliza ordem das chaves e datas", () => {
    expect(snapshotsEqual(
      { changedAt: new Date("2026-07-28T12:00:00.000Z"), name: "A" },
      { name: "A", changedAt: "2026-07-28T12:00:00.000Z" }
    )).toBe(true);
  });
});

describe("getUndoEligibility", () => {
  const entry = { action: "update", snapshotAfter: { id: 1, name: "B" }, archivedAt: null, revertedAt: null };
  it("só permite quando o estado atual é exatamente o snapshotAfter", () => {
    expect(getUndoEligibility(entry, { id: 1, name: "B" }).status).toBe("undoable");
    expect(getUndoEligibility(entry, { id: 1, name: "C" }).status).toBe("stale");
  });
  it("rejeita entrada arquivada ou já revertida", () => {
    expect(getUndoEligibility({ ...entry, archivedAt: new Date() }, null).status).toBe("stale");
    expect(getUndoEligibility({ ...entry, revertedAt: new Date() }, null).status).toBe("reverted");
  });
  it("só desfaz exclusão se o registro continuar ausente", () => {
    const deleted = { ...entry, action: "delete", snapshotAfter: null };
    expect(getUndoEligibility(deleted, null).status).toBe("undoable");
    expect(getUndoEligibility(deleted, { id: 1 }).status).toBe("stale");
  });
});
