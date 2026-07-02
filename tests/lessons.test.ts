import { describe, it, expect } from "vitest";
import { lessons } from "../src/lessons/index";
import { mulberry32 } from "../src/lessons/gen";
import type { Cursor, Task } from "../src/lessons/types";

function inBounds(text: string, c: Cursor): boolean {
  const lines = text.split("\n");
  if (c.line < 0 || c.line >= lines.length) return false;
  return c.col >= 0 && c.col <= lines[c.line].length;
}

function checkTask(t: Task, label: string): void {
  expect(t.instruction.length, `${label} instruction`).toBeGreaterThan(0);
  expect(inBounds(t.startText, t.startCursor), `${label} startCursor`).toBe(true);
  if (t.targetCursor) {
    expect(inBounds(t.targetText, t.targetCursor), `${label} targetCursor`).toBe(true);
  }
  if (t.marks) {
    const lines = t.startText.split("\n");
    for (const m of t.marks) {
      expect(m.line, `${label} mark line`).toBeLessThan(lines.length);
      expect(m.from, `${label} mark from`).toBeGreaterThanOrEqual(0);
      expect(m.to, `${label} mark to`).toBeGreaterThan(m.from);
      expect(m.to, `${label} mark to bounds`).toBeLessThanOrEqual(lines[m.line].length);
    }
  }
  // The task must actually require something: a text change, a cursor move,
  // or a round-trip through insert mode.
  const changesText = t.targetText !== t.startText;
  const changesCursor =
    t.targetCursor !== undefined &&
    (t.targetCursor.line !== t.startCursor.line || t.targetCursor.col !== t.startCursor.col);
  expect(changesText || changesCursor || t.requireNormal === true, `${label} start equals target`).toBe(true);
}

describe("lesson data", () => {
  it("has lessons in strictly ascending order with unique ids", () => {
    expect(lessons.length).toBe(18);
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
    }
  });

  it("every lesson has intro text, a key reference, and generators", () => {
    for (const l of lessons) {
      expect(l.intro.length, l.id).toBeGreaterThan(0);
      expect(l.keys.length, l.id).toBeGreaterThan(0);
      expect(l.taskCount, l.id).toBeGreaterThanOrEqual(6);
      expect(l.generators.length, l.id).toBeGreaterThan(0);
      for (const k of l.keys) {
        expect(k.keys.length, l.id).toBeGreaterThan(0);
        expect(k.label.length, l.id).toBeGreaterThan(0);
      }
    }
  });

  it("every generator produces well-formed tasks across many seeds", () => {
    for (const lesson of lessons) {
      for (let seed = 1; seed <= 25; seed++) {
        const rng = mulberry32(seed * 7919 + lesson.order);
        lesson.generators.forEach((gen, gi) => {
          checkTask(gen(rng), `${lesson.id} gen[${gi}] seed ${seed}`);
        });
      }
    }
  });
});
