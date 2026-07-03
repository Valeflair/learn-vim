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

  it("renders the green target cell and diff-derived red marks", () => {
    const ed = createEditor({
      parent,
      doc: "junk hello world",
      target: { line: 0, col: 6 },
      targetText: "hello world",
    });
    expect(parent.querySelector(".lv-target")).not.toBeNull();
    expect(parent.querySelector(".lv-mark")!.textContent).toBe("junk ");
    ed.destroy();
  });

  it("shrinks the red mark as junk is deleted and drops it when done", () => {
    const ed = createEditor({
      parent,
      doc: "xyhello",
      cursor: { line: 0, col: 0 },
      targetText: "hello",
    });
    ed.focus();
    expect(parent.querySelector(".lv-mark")!.textContent).toBe("xy");
    press("x");
    expect(parent.querySelector(".lv-mark")!.textContent).toBe("y");
    press("x");
    expect(ed.getText()).toBe("hello");
    expect(parent.querySelector(".lv-mark")).toBeNull();
    ed.destroy();
  });

  it("ghosts missing text where it belongs", () => {
    const ed = createEditor({ parent, doc: "hello wrld", targetText: "hello world" });
    expect(parent.querySelector(".lv-ghost")!.textContent).toBe("o");
    expect(parent.querySelector(".lv-mark")).toBeNull();
    ed.destroy();
  });

  it("ghosts a whole missing line and reds a surplus line", () => {
    const missing = createEditor({ parent, doc: "a\nc", targetText: "a\nb\nc" });
    expect(parent.querySelector(".lv-ghost")!.textContent).toBe("⏎b");
    missing.destroy();

    const surplus = createEditor({ parent, doc: "a\nJUNK\nc", targetText: "a\nc" });
    expect(parent.querySelector(".lv-mark")!.textContent).toBe("JUNK");
    surplus.destroy();
  });

  it("truncates long ghost text but keeps short ghosts whole", () => {
    const long = createEditor({
      parent,
      doc: "a",
      targetText: 'a\nconst demo = parseLine("mode,dark,wide");',
    });
    const ghost = parent.querySelector(".lv-ghost")!.textContent!;
    expect(ghost.length).toBeLessThanOrEqual(24);
    expect(ghost.endsWith("…")).toBe(true);
    long.destroy();

    const short = createEditor({ parent, doc: "a\nc", targetText: "a\nb\nc" });
    expect(parent.querySelector(".lv-ghost")!.textContent).toBe("⏎b");
    short.destroy();
  });

  it("renders hybrid line numbers: absolute on the cursor line, relative elsewhere", () => {
    const ed = createEditor({ parent, doc: "a\nb\nc\nd\ne", cursor: { line: 2, col: 0 } });
    const nums = [...parent.querySelectorAll(".lv-lnr")].map((n) => n.textContent);
    expect(nums).toEqual(["2", "1", "3", "1", "2"]);
    expect(parent.querySelector(".lv-lnr-current")!.textContent).toBe("3");
    ed.destroy();
  });

  it("updates the hybrid numbers when the cursor moves", () => {
    const ed = createEditor({ parent, doc: "a\nb\nc\nd\ne", cursor: { line: 2, col: 0 } });
    ed.focus();
    // j/k are display motions and unreliable in jsdom; gg is line-wise.
    press("g");
    press("g");
    const nums = [...parent.querySelectorAll(".lv-lnr")].map((n) => n.textContent);
    expect(nums).toEqual(["1", "1", "2", "3", "4"]);
    expect(parent.querySelector(".lv-lnr-current")!.textContent).toBe("1");
    ed.destroy();
  });

  it("renders focus marks", () => {
    const ed = createEditor({
      parent,
      doc: "hello world",
      marks: [{ line: 0, from: 0, to: 5, kind: "focus" }],
    });
    expect(parent.querySelector(".lv-focus")).not.toBeNull();
    expect(parent.querySelector(".lv-mark")).toBeNull();
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
