import { describe, it, expect } from "vitest";
import { parseRoute } from "../src/ui/router";

describe("parseRoute", () => {
  it("parses lesson routes", () => {
    expect(parseRoute("#/lesson/03-insert-commands")).toEqual({ screen: "lesson", lessonId: "03-insert-commands" });
  });
  it("falls back to home for everything else", () => {
    expect(parseRoute("")).toEqual({ screen: "home" });
    expect(parseRoute("#/")).toEqual({ screen: "home" });
    expect(parseRoute("#/lesson/")).toEqual({ screen: "home" });
    expect(parseRoute("#/bogus/x")).toEqual({ screen: "home" });
  });
});
