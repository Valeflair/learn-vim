import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderRevision } from "../src/ui/revision";
import { chapters } from "../src/lessons/index";

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

describe("renderRevision", () => {
  it("shows a scope chooser first", () => {
    cleanup = renderRevision(app, chapters()[2]);
    expect(app.querySelector("h1")!.textContent).toContain("Revision: Essential Motions");
    expect(app.querySelector(".scope-chapter")).not.toBeNull();
    expect(app.querySelector(".scope-all")).not.toBeNull();
    expect(app.querySelector(".cm-editor")).toBeNull();
  });

  it("starts a 10-task chapter drill", () => {
    cleanup = renderRevision(app, chapters()[2]);
    app.querySelector<HTMLButtonElement>(".scope-chapter")!.click();
    expect(app.querySelector(".cm-editor")).not.toBeNull();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 10");
  });

  it("starts a 15-task everything drill", () => {
    cleanup = renderRevision(app, chapters()[2]);
    app.querySelector<HTMLButtonElement>(".scope-all")!.click();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 15");
  });
});
