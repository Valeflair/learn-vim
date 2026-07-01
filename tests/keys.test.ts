import { describe, it, expect } from "vitest";
import { formatKey } from "../src/engine/keys";

const kb = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

describe("formatKey", () => {
  it("returns printable keys as-is", () => {
    expect(formatKey(kb({ key: "a" }))).toBe("a");
    expect(formatKey(kb({ key: "D", shiftKey: true }))).toBe("D");
    expect(formatKey(kb({ key: "$", shiftKey: true }))).toBe("$");
  });
  it("returns null for pure modifier presses", () => {
    expect(formatKey(kb({ key: "Shift", shiftKey: true }))).toBeNull();
    expect(formatKey(kb({ key: "Control", ctrlKey: true }))).toBeNull();
    expect(formatKey(kb({ key: "Alt" }))).toBeNull();
  });
  it("maps special keys to bracket notation", () => {
    expect(formatKey(kb({ key: "Escape" }))).toBe("<Esc>");
    expect(formatKey(kb({ key: "Enter" }))).toBe("<CR>");
    expect(formatKey(kb({ key: "Backspace" }))).toBe("<BS>");
    expect(formatKey(kb({ key: " " }))).toBe("<Space>");
    expect(formatKey(kb({ key: "Tab" }))).toBe("<Tab>");
  });
  it("formats ctrl chords", () => {
    expect(formatKey(kb({ key: "r", ctrlKey: true }))).toBe("<C-r>");
    expect(formatKey(kb({ key: "d", ctrlKey: true }))).toBe("<C-d>");
  });
  it("returns null for unmapped function keys", () => {
    expect(formatKey(kb({ key: "F5" }))).toBeNull();
  });
});
