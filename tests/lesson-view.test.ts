import { describe, it, expect, beforeEach } from "vitest";
import { renderLesson } from "../src/ui/lesson";
import { isChallengeDone } from "../src/progress/store";
import type { Lesson } from "../src/lessons/types";

const lesson: Lesson = {
  id: "t-lesson",
  title: "Test Lesson",
  section: "T",
  order: 1,
  steps: [
    { kind: "explanation", text: "Use `x` to delete." },
    {
      kind: "challenge",
      id: "t-x",
      instruction: "Delete the first character with `x`.",
      startText: "xhello",
      startCursor: { line: 0, col: 0 },
      targetText: "hello",
      par: 1,
      hint: "just press x",
    },
  ],
};

let app: HTMLElement;
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  app = document.querySelector<HTMLElement>("#app")!;
});

function press(key: string) {
  app.querySelector(".cm-content")!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("renderLesson", () => {
  it("shows explanation first with Continue, renders inline code", () => {
    renderLesson(app, lesson);
    expect(app.textContent).toContain("Use");
    expect(app.querySelector(".instruction code, .explanation code")).not.toBeNull();
    expect(app.querySelector("button.primary")!.textContent).toBe("Continue");
  });

  it("mounts editor on challenge step and solves via keystroke", () => {
    renderLesson(app, lesson);
    (app.querySelector("button.primary") as HTMLButtonElement).click();
    expect(app.querySelector(".cm-editor")).not.toBeNull();
    press("x");
    expect(app.querySelector(".solved")).not.toBeNull();
    expect(isChallengeDone("t-x")).toBe(true);
  });

  it("reset restores start state", () => {
    renderLesson(app, lesson);
    (app.querySelector("button.primary") as HTMLButtonElement).click();
    press("j");
    const reset = [...app.querySelectorAll("button")].find((b) => b.textContent === "Reset")!;
    reset.click();
    expect(app.querySelector(".keys")!.textContent).toBe("");
    expect(app.querySelector(".cm-content")!.textContent).toContain("xhello");
  });

  it("skip advances without marking done", () => {
    renderLesson(app, lesson);
    (app.querySelector("button.primary") as HTMLButtonElement).click();
    const skip = [...app.querySelectorAll("button")].find((b) => b.textContent === "Skip")!;
    skip.click();
    expect(app.textContent).toContain("Lesson complete");
    expect(isChallengeDone("t-x")).toBe(false);
  });
});
