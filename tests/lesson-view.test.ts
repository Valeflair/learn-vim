import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderLesson } from "../src/ui/lesson";
import { lessonRecord } from "../src/progress/store";
import { lessons } from "../src/lessons/index";
import type { Lesson } from "../src/lessons/types";

// A deterministic drill: every task is "press x once" (drivable in jsdom).
const lesson: Lesson = {
  id: "t-lesson",
  title: "Test Lesson",
  section: "T",
  order: 1,
  intro: ["Use `x` to delete the character under the cursor."],
  keys: [{ keys: "x", label: "delete character" }],
  taskCount: 2,
  generators: [
    () => ({
      instruction: "Delete the highlighted letter with `x`",
      keyHint: "x",
      startText: "xhello",
      startCursor: { line: 0, col: 0 },
      targetText: "hello",
      marks: [{ line: 0, from: 0, to: 1 }],
    }),
  ],
};

let app: HTMLElement;
let cleanup: (() => void) | null = null;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  app = document.querySelector<HTMLElement>("#app")!;
});

afterEach(() => {
  cleanup?.();
  cleanup = null;
});

function press(key: string) {
  app.querySelector(".cm-content")!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

const settle = () => new Promise((r) => setTimeout(r, 350));

describe("renderLesson", () => {
  it("keeps intro and key reference visible alongside the drill", () => {
    cleanup = renderLesson(app, lesson);
    expect(app.querySelector(".intro kbd")).not.toBeNull();
    expect(app.querySelectorAll(".key-ref li").length).toBe(1);
    expect(app.querySelector(".cm-editor")).not.toBeNull();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 2");
    expect(app.textContent).not.toContain("par");
  });

  it("shows the task instruction, key hint, and red mark", () => {
    cleanup = renderLesson(app, lesson);
    expect(app.querySelector(".task-instruction")!.textContent).toContain("Delete the highlighted letter");
    expect(app.querySelector(".key-chip")!.textContent).toBe("x");
    expect(app.querySelector(".lv-mark")).not.toBeNull();
  });

  it("counts keystrokes and starts the timer on the first key", () => {
    cleanup = renderLesson(app, lesson);
    press("j");
    press("k");
    expect(app.querySelector(".kcount")!.textContent).toBe("2 keys");
  });

  it("advances through tasks and records the result", async () => {
    cleanup = renderLesson(app, lesson);
    press("x");
    expect(app.querySelector(".editor-wrap.solved")).not.toBeNull();
    await settle();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 2 of 2");
    press("x");
    await settle();
    expect(app.querySelector(".results")).not.toBeNull();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Drill complete");
    const rec = lessonRecord("t-lesson");
    expect(rec?.done).toBe(true);
    expect(rec?.bestKeystrokes).toBe(2);
    // No duplicate "Next" link — the bottom nav already has one.
    expect(app.querySelector(".results")!.textContent).not.toContain("Next:");
  });

  it("offers a revision rerun and lists previous runs", async () => {
    cleanup = renderLesson(app, lesson);
    expect(app.querySelector(".runs-list")!.textContent).toContain("no runs yet");
    press("x");
    await settle();
    press("x");
    await settle();
    expect(app.querySelectorAll(".runs-list li").length).toBe(1);

    const rev = app.querySelector<HTMLButtonElement>(".again-rev")!;
    rev.click();
    expect(app.querySelector(".drill-count")!.textContent).toContain("· revision");
  });

  it("navigates between lessons with Ctrl+j and Ctrl+k", () => {
    location.hash = "";
    cleanup = renderLesson(app, lessons[1]);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", ctrlKey: true }));
    expect(location.hash).toBe(`#/lesson/${lessons[2].id}`);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(location.hash).toBe(`#/lesson/${lessons[0].id}`);
    // Without ctrl, j/k must stay ordinary vim keys.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j" }));
    expect(location.hash).toBe(`#/lesson/${lessons[0].id}`);
  });

  it("shows the nav hotkey hints on the prev/next links", () => {
    cleanup = renderLesson(app, lessons[1]);
    expect(app.querySelector(".nav-prev .nav-hint")!.textContent).toContain("Ctrl+K");
    expect(app.querySelector(".nav-next .nav-hint")!.textContent).toContain("Ctrl+J");
  });

  it("restart begins a fresh drill", async () => {
    cleanup = renderLesson(app, lesson);
    press("x");
    await settle();
    const restart = [...app.querySelectorAll("button")].find((b) => b.textContent!.includes("restart"))!;
    restart.click();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 2");
    expect(app.querySelector(".kcount")!.textContent).toBe("0 keys");
  });
});
