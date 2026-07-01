import { describe, it, expect } from "vitest";

describe("scaffold", () => {
  it("runs tests in jsdom with localStorage", () => {
    localStorage.setItem("x", "1");
    expect(localStorage.getItem("x")).toBe("1");
  });
});
