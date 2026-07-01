import { describe, it, expect } from "vitest";
import { lessons } from "../src/lessons/index";
import type { Challenge, Cursor } from "../src/lessons/types";

function inBounds(text: string, c: Cursor): boolean {
  const lines = text.split("\n");
  if (c.line < 0 || c.line >= lines.length) return false;
  return c.col >= 0 && c.col <= lines[c.line].length;
}

const allChallenges: Challenge[] = lessons.flatMap((l) =>
  l.steps.filter((s): s is Challenge => s.kind === "challenge"),
);

describe("lesson data", () => {
  it("has lessons in strictly ascending order with unique ids", () => {
    expect(lessons.length).toBeGreaterThan(0);
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
    }
  });

  it("has globally unique challenge ids", () => {
    const ids = allChallenges.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every challenge is well-formed", () => {
    for (const c of allChallenges) {
      expect(c.instruction.length, c.id).toBeGreaterThan(0);
      expect(c.par, c.id).toBeGreaterThanOrEqual(1);
      expect(inBounds(c.startText, c.startCursor), `${c.id} startCursor`).toBe(true);
      if (c.targetCursor) expect(inBounds(c.targetText, c.targetCursor), `${c.id} targetCursor`).toBe(true);
      const changesText = c.targetText !== c.startText;
      const changesCursor =
        c.targetCursor !== undefined &&
        (c.targetCursor.line !== c.startCursor.line || c.targetCursor.col !== c.startCursor.col);
      expect(changesText || changesCursor || c.requireNormal === true, `${c.id} start equals target`).toBe(true);
    }
  });
});
