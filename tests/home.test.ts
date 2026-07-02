import { describe, it, expect, beforeEach } from "vitest";
import { renderHome } from "../src/ui/home";
import { lessons } from "../src/lessons/index";
import { recordResult } from "../src/progress/store";

let app: HTMLElement;
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  app = document.querySelector<HTMLElement>("#app")!;
});

describe("renderHome", () => {
  it("renders a linked card per lesson", () => {
    renderHome(app);
    const cards = app.querySelectorAll("a.card");
    expect(cards.length).toBe(lessons.length);
    expect(cards[0].getAttribute("href")).toBe(`#/lesson/${lessons[0].id}`);
    expect(app.querySelectorAll(".card-done").length).toBe(0);
  });

  it("shows best time and keystrokes on completed lessons", () => {
    recordResult(lessons[0].id, 61_000, 42);
    renderHome(app);
    expect(app.querySelectorAll(".card-done").length).toBe(1);
    const best = app.querySelector(".card-done .card-best")!.textContent!;
    expect(best).toContain("01:01");
    expect(best).toContain("42");
    expect(app.textContent).toContain(`1 of ${lessons.length} lessons completed`);
  });
});
