import { describe, it, expect, beforeEach } from "vitest";
import { createEditor } from "../src/engine/editor";

let parent: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = "";
  parent = document.createElement("div");
  document.body.appendChild(parent);
});

function press(key: string, init: KeyboardEventInit = {}) {
  const target = parent.querySelector(".cm-content")!;
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
}

describe("createEditor", () => {
  it("reports initial text, cursor and mode", () => {
    const ed = createEditor({ parent, doc: "hello\nworld", cursor: { line: 1, col: 2 } });
    expect(ed.getText()).toBe("hello\nworld");
    expect(ed.getCursor()).toEqual({ line: 1, col: 2 });
    expect(ed.getMode()).toBe("normal");
    ed.destroy();
  });

  it("clamps out-of-range cursor col to line end", () => {
    const ed = createEditor({ parent, doc: "hi", cursor: { line: 0, col: 99 } });
    expect(ed.getCursor().line).toBe(0);
    ed.destroy();
  });

  it("processes normal-mode vim keys (x deletes char)", () => {
    const ed = createEditor({ parent, doc: "xhello", cursor: { line: 0, col: 0 } });
    ed.focus();
    press("x");
    expect(ed.getText()).toBe("hello");
    ed.destroy();
  });

  it("reports keystrokes and mode changes", () => {
    const keys: string[] = [];
    const modes: string[] = [];
    const ed = createEditor({
      parent,
      doc: "hello",
      onKey: (k) => keys.push(k),
      onModeChange: (m) => modes.push(m),
    });
    ed.focus();
    press("i");
    press("Escape");
    expect(keys).toEqual(["i", "<Esc>"]);
    expect(modes).toContain("insert");
    expect(ed.getMode()).toBe("normal");
    ed.destroy();
  });
});
