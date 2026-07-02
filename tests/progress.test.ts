import { describe, it, expect, beforeEach } from "vitest";
import { loadProgress, recordResult, lessonRecord, isLessonDone, formatTime } from "../src/progress/store";

beforeEach(() => localStorage.clear());

describe("progress store", () => {
  it("starts empty", () => {
    expect(loadProgress()).toEqual({ version: 2, lessons: {} });
    expect(lessonRecord("l1")).toBeNull();
    expect(isLessonDone("l1")).toBe(false);
  });

  it("keeps best time and best keystrokes independently", () => {
    recordResult("l1", 90_000, 120);
    recordResult("l1", 60_000, 200);
    recordResult("l1", 80_000, 100);
    expect(lessonRecord("l1")).toEqual({ done: true, bestTimeMs: 60_000, bestKeystrokes: 100 });
    expect(isLessonDone("l1")).toBe(true);
  });

  it("survives corrupt data", () => {
    localStorage.setItem("learn-vim-progress-v2", "{not json");
    expect(loadProgress()).toEqual({ version: 2, lessons: {} });
    localStorage.setItem("learn-vim-progress-v2", JSON.stringify({ version: 99 }));
    expect(loadProgress()).toEqual({ version: 2, lessons: {} });
  });

  it("formats times as mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(61_500)).toBe("01:01");
    expect(formatTime(600_000)).toBe("10:00");
  });
});
