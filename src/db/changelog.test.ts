import { describe, it, expect } from "vitest";
import { computeUndo } from "./changelog";

describe("computeUndo", () => {
  it("update → restaura o estado anterior", () => {
    expect(computeUndo({ action: "update", snapshotBefore: { name: "A" }, snapshotAfter: { name: "B" } }))
      .toEqual({ op: "restore", data: { name: "A" } });
  });
  it("delete → recria o registro anterior", () => {
    expect(computeUndo({ action: "delete", snapshotBefore: { id: 1 }, snapshotAfter: null }))
      .toEqual({ op: "recreate", data: { id: 1 } });
  });
  it("create → apaga o registro criado", () => {
    expect(computeUndo({ action: "create", snapshotBefore: null, snapshotAfter: { id: 2 } }))
      .toEqual({ op: "delete", data: { id: 2 } });
  });
});
