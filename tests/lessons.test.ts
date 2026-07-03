import { describe, it, expect } from "vitest";
import { lessons, chapters, getChapter, chapterPool, cumulativePool } from "../src/lessons/index";
import { mulberry32, SNIPPETS, SHORT_SNIPPETS } from "../src/lessons/gen";
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
  const lines = t.startText.split("\n");
  if (t.marks) {
    for (const m of t.marks) {
      expect(m.line, `${label} mark line`).toBeLessThan(lines.length);
      expect(m.from, `${label} mark from`).toBeGreaterThanOrEqual(0);
      expect(m.to, `${label} mark to`).toBeGreaterThan(m.from);
      expect(m.to, `${label} mark to bounds`).toBeLessThanOrEqual(lines[m.line].length);
    }
  }
  if (t.ghost) {
    expect(t.ghost.line, `${label} ghost line`).toBeLessThan(lines.length);
    expect(t.ghost.col, `${label} ghost col`).toBeLessThanOrEqual(lines[t.ghost.line].length);
    expect(t.ghost.text.length, `${label} ghost text`).toBeGreaterThan(0);
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
  it("has 29 lessons in strictly ascending order with unique ids", () => {
    expect(lessons.length).toBe(29);
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

  it("chapters cover all lessons in order with unique slugs", () => {
    const chs = chapters();
    expect(chs.map((c) => c.name)).toEqual([
      "Basics", "Insert Like a Pro", "Essential Motions", "Operators",
      "Vertical Motions", "Search", "Text Objects", "Visual Mode", "Power Tools",
    ]);
    expect(chs.map((c) => c.slug)).toEqual([
      "basics",
      "insert-like-a-pro",
      "essential-motions",
      "operators",
      "vertical-motions",
      "search",
      "text-objects",
      "visual-mode",
      "power-tools",
    ]);
    expect(new Set(chs.map((c) => c.slug)).size).toBe(chs.length);
    expect(chs.flatMap((c) => c.lessons)).toEqual(lessons);
    expect(getChapter(chs[2].slug)?.name).toBe("Essential Motions");
    expect(getChapter("nope")).toBeUndefined();
  });

  it("revision pools are non-empty and skip custom-snippet lessons", () => {
    for (const ch of chapters()) {
      const own = chapterPool(ch);
      const all = cumulativePool(ch);
      expect(own.length, ch.slug).toBeGreaterThan(0);
      expect(all.length, ch.slug).toBeGreaterThanOrEqual(own.length);
      for (const l of lessons.filter((x) => x.snippets)) {
        for (const g of l.generators) {
          expect(own, ch.slug).not.toContain(g);
          expect(all, ch.slug).not.toContain(g);
        }
      }
    }
    const last = chapters().at(-1)!;
    const covered = lessons.filter((l) => !l.snippets).flatMap((l) => l.generators);
    expect(cumulativePool(last)).toEqual(covered);
  });

  it("every generator produces well-formed tasks for every snippet across many seeds", () => {
    for (const lesson of lessons) {
      const pool = lesson.snippets ?? SNIPPETS;
      pool.forEach((snippet, si) => {
        for (let seed = 1; seed <= 25; seed++) {
          const rng = mulberry32(seed * 7919 + lesson.order * 131 + si);
          lesson.generators.forEach((gen, gi) => {
            checkTask(gen(rng, snippet), `${lesson.id} gen[${gi}] snippet ${si} seed ${seed}`);
          });
        }
      });
    }
  });

  it("opening-new-lines uses short-line snippets so typing stays minimal", () => {
    const l06 = lessons.find((l) => l.id === "06-opening-new-lines")!;
    expect(l06.snippets).toBe(SHORT_SNIPPETS);
    expect(SHORT_SNIPPETS.length).toBeGreaterThanOrEqual(4);
    for (const snip of SHORT_SNIPPETS) {
      expect(snip.length).toBeGreaterThanOrEqual(5);
      for (const line of snip) {
        expect(line.length).toBeLessThanOrEqual(16);
        expect(line).toBe(line.trimStart());
        expect(line.trim()).not.toBe("");
      }
    }
  });
});
