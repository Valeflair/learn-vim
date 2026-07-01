import { describe, it, expect } from "vitest";
import { Referee } from "../src/challenge/referee";
import type { Challenge } from "../src/lessons/types";

const base: Challenge = {
  kind: "challenge",
  id: "t-1",
  instruction: "delete the first char",
  startText: "xhello",
  startCursor: { line: 0, col: 0 },
  targetText: "hello",
  par: 1,
};

describe("Referee", () => {
  it("solves on text match", () => {
    const r = new Referee(base);
    expect(r.check("xhello", { line: 0, col: 0 }, "normal")).toBe(false);
    expect(r.check("hello", { line: 0, col: 0 }, "normal")).toBe(true);
    expect(r.solved).toBe(true);
  });

  it("requires cursor match when targetCursor set", () => {
    const r = new Referee({ ...base, targetText: "xhello", targetCursor: { line: 0, col: 3 } });
    expect(r.check("xhello", { line: 0, col: 2 }, "normal")).toBe(false);
    expect(r.check("xhello", { line: 0, col: 3 }, "normal")).toBe(true);
  });

  it("requires normal mode when requireNormal set", () => {
    const r = new Referee({ ...base, requireNormal: true });
    expect(r.check("hello", { line: 0, col: 4 }, "insert")).toBe(false);
    expect(r.check("hello", { line: 0, col: 4 }, "normal")).toBe(true);
  });

  it("counts keystrokes and compares to par", () => {
    const r = new Referee({ ...base, par: 2 });
    r.onKey("x");
    expect(r.count).toBe(1);
    expect(r.underPar).toBe(true);
    r.onKey("u");
    r.onKey("x");
    expect(r.count).toBe(3);
    expect(r.underPar).toBe(false);
  });

  it("ignores keys after solved and stays solved", () => {
    const r = new Referee(base);
    r.onKey("x");
    r.check("hello", { line: 0, col: 0 }, "normal");
    r.onKey("j");
    expect(r.count).toBe(1);
    expect(r.check("whatever", { line: 0, col: 0 }, "normal")).toBe(true);
  });

  it("reset clears keystrokes and solved", () => {
    const r = new Referee(base);
    r.onKey("x");
    r.check("hello", { line: 0, col: 0 }, "normal");
    r.reset();
    expect(r.count).toBe(0);
    expect(r.solved).toBe(false);
  });
});
