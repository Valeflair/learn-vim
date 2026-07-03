import { describe, it, expect } from "vitest";
import { Drill, charsWrong } from "../src/challenge/drill";
import type { Lesson, TaskGen } from "../src/lessons/types";

const moveGen: TaskGen = () => ({
  instruction: "move",
  startText: "abc",
  startCursor: { line: 0, col: 0 },
  targetText: "abc",
  targetCursor: { line: 0, col: 2 },
});

const editGen: TaskGen = () => ({
  instruction: "edit",
  startText: "xabc",
  startCursor: { line: 0, col: 0 },
  targetText: "abc",
});

const insertGen: TaskGen = () => ({
  instruction: "insert",
  startText: "",
  startCursor: { line: 0, col: 0 },
  targetText: "hi",
  requireNormal: true,
});

function fakeLesson(generators: TaskGen[], taskCount = 4): Lesson {
  return {
    id: "fake",
    title: "Fake",
    section: "S",
    order: 1,
    intro: ["intro"],
    keys: [{ keys: "x", label: "delete" }],
    taskCount,
    generators,
  };
}

describe("Drill", () => {
  it("generates exactly taskCount tasks and is deterministic per seed", () => {
    const lesson = fakeLesson([moveGen, editGen], 7);
    const a = new Drill(lesson, 42);
    const b = new Drill(lesson, 42);
    const c = new Drill(lesson, 43);
    expect(a.tasks.length).toBe(7);
    expect(a.tasks.map((t) => t.instruction)).toEqual(b.tasks.map((t) => t.instruction));
    expect(c.tasks.length).toBe(7);
  });

  it("cycles all generators before repeating", () => {
    const drill = new Drill(fakeLesson([moveGen, editGen, insertGen], 6), 1);
    const firstThree = drill.tasks.slice(0, 3).map((t) => t.instruction);
    expect(new Set(firstThree).size).toBe(3);
  });

  it("starts the clock on the first keystroke and counts every key", () => {
    const drill = new Drill(fakeLesson([editGen]), 1);
    expect(drill.state).toBe("idle");
    expect(drill.elapsedMs(5000)).toBe(0);
    drill.recordKey(1000);
    drill.recordKey(1200);
    drill.recordKey(1400);
    expect(drill.state).toBe("running");
    expect(drill.keystrokes).toBe(3);
    expect(drill.elapsedMs(2000)).toBe(1000);
  });

  it("checks text, cursor, and mode requirements", () => {
    const drill = new Drill(fakeLesson([moveGen], 1), 1);
    expect(drill.check("abc", { line: 0, col: 0 }, "normal")).toBe(false);
    expect(drill.check("abX", { line: 0, col: 2 }, "normal")).toBe(false);
    expect(drill.check("abc", { line: 0, col: 2 }, "normal")).toBe(true);

    const ins = new Drill(fakeLesson([insertGen], 1), 1);
    expect(ins.check("hi", { line: 0, col: 1 }, "insert")).toBe(false);
    expect(ins.check("hi", { line: 0, col: 1 }, "normal")).toBe(true);
  });

  it("advances through tasks and reports time and keystrokes at the end", () => {
    const drill = new Drill(fakeLesson([editGen], 2), 1);
    drill.recordKey(1000);
    drill.advance(1500);
    expect(drill.state).toBe("running");
    expect(drill.taskIndex).toBe(1);
    drill.recordKey(1800);
    drill.advance(2500);
    expect(drill.state).toBe("finished");
    expect(drill.result()).toEqual({ timeMs: 1500, keystrokes: 2 });
    // Finished drills ignore further keys.
    drill.recordKey(9000);
    expect(drill.result()!.keystrokes).toBe(2);
  });
});

describe("charsWrong", () => {
  it("is 0 for identical strings", () => {
    expect(charsWrong("hello", "hello")).toBe(0);
  });
  it("counts differing middles from both sides", () => {
    expect(charsWrong("abc", "axc")).toBe(2);
    expect(charsWrong("hello", "helo")).toBe(1);
    expect(charsWrong("", "abc")).toBe(3);
  });
  it("grows when an edit moves away from the target", () => {
    const target = "hello";
    const baseline = charsWrong("xhello", target);
    expect(charsWrong("zxhello", target)).toBeGreaterThan(baseline);
    expect(charsWrong("hello", target)).toBeLessThan(baseline);
  });
});
