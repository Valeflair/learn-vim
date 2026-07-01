import type { Lesson } from "./types";

export const lesson: Lesson = {
  id: "17-macros",
  title: "Macros (q @ @@)",
  section: "Power features",
  order: 17,
  steps: [
    {
      kind: "explanation",
      text: "`q{letter}` starts recording your keystrokes into a register; `q` again stops. `@{letter}` replays them, `@@` replays the last-used macro. Record an edit that ends by moving to the next line, and one macro fixes a whole file.\n\nIf a recording goes wrong, hit Reset — it clears the editor state, including a half-recorded macro.",
    },
    {
      kind: "challenge",
      id: "17-basic",
      instruction: "Turn every line into a list item: record `qa` → `I- <Esc>j` → `q` on the first line, then replay with `@a` three times.",
      startText: "apple\nbanana\ncherry\ndate",
      startCursor: { line: 0, col: 0 },
      targetText: "- apple\n- banana\n- cherry\n- date",
      requireNormal: true,
      par: 14,
      hint: "qa I- <Esc> j q, then @a @a @a",
    },
    {
      kind: "challenge",
      id: "17-atat",
      instruction: "Append `;` to every line: record it once on line 1 (ending with `j`), replay with `@a`, then again with `@@`.",
      startText: "let a = 1\nlet b = 2\nlet c = 3",
      startCursor: { line: 0, col: 0 },
      targetText: "let a = 1;\nlet b = 2;\nlet c = 3;",
      requireNormal: true,
      par: 11,
      hint: "qa A; <Esc> j q, then @a, then @@",
    },
  ],
};
