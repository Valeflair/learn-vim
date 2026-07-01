import { describe, it, expect, beforeEach } from "vitest";
import { loadProgress, recordResult, isChallengeDone, lessonProgress } from "../src/progress/store";
import type { Lesson } from "../src/lessons/types";

const lesson: Lesson = {
  id: "l1",
  title: "L1",
  section: "S",
  order: 1,
  steps: [
    { kind: "explanation", text: "hi" },
    { kind: "challenge", id: "c1", instruction: "x", startText: "a", startCursor: { line: 0, col: 0 }, targetText: "b", par: 1 },
    { kind: "challenge", id: "c2", instruction: "y", startText: "a", startCursor: { line: 0, col: 0 }, targetText: "c", par: 1 },
  ],
};

beforeEach(() => localStorage.clear());

describe("progress store", () => {
  it("starts empty", () => {
    expect(loadProgress()).toEqual({ version: 1, challenges: {} });
    expect(isChallengeDone("c1")).toBe(false);
  });

  it("records results and keeps best keystroke count", () => {
    recordResult("c1", 9);
    recordResult("c1", 4);
    recordResult("c1", 7);
    expect(loadProgress().challenges["c1"]).toEqual({ done: true, bestKeystrokes: 4 });
    expect(isChallengeDone("c1")).toBe(true);
  });

  it("survives corrupt data", () => {
    localStorage.setItem("learn-vim-progress-v1", "{not json");
    expect(loadProgress()).toEqual({ version: 1, challenges: {} });
    localStorage.setItem("learn-vim-progress-v1", JSON.stringify({ version: 99 }));
    expect(loadProgress()).toEqual({ version: 1, challenges: {} });
  });

  it("computes lesson progress", () => {
    expect(lessonProgress(lesson)).toBe("none");
    recordResult("c1", 3);
    expect(lessonProgress(lesson)).toBe("partial");
    recordResult("c2", 3);
    expect(lessonProgress(lesson)).toBe("done");
  });
});
