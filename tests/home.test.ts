import { describe, it, expect, beforeEach } from "vitest";
import { renderHome } from "../src/ui/home";
import { lessons } from "../src/lessons/index";
import { recordResult } from "../src/progress/store";
import type { Challenge } from "../src/lessons/types";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
});

describe("renderHome", () => {
  it("renders a linked card per lesson", () => {
    const app = document.querySelector<HTMLElement>("#app")!;
    renderHome(app);
    const cards = app.querySelectorAll("a.card");
    expect(cards.length).toBe(lessons.length);
    expect(cards[0].getAttribute("href")).toBe(`#/lesson/${lessons[0].id}`);
    expect(app.querySelectorAll(".card-none").length).toBe(lessons.length);
  });

  it("reflects progress state", () => {
    const first = lessons[0].steps.find((s): s is Challenge => s.kind === "challenge")!;
    recordResult(first.id, 5);
    const app = document.querySelector<HTMLElement>("#app")!;
    renderHome(app);
    expect(app.querySelectorAll(".card-partial").length).toBe(1);
  });
});
