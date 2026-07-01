import type { Lesson } from "./types";

export const lesson: Lesson = {
  id: "11-replace-misc",
  title: "Replace & Misc (r R ~ J)",
  section: "Editing",
  order: 11,
  steps: [
    {
      kind: "explanation",
      text: "`r{char}` replaces the character under the cursor without entering insert mode. `R` enters **replace mode** — everything you type overwrites. `~` toggles case and moves right. `J` joins the next line onto this one with a space.",
    },
    {
      kind: "challenge",
      id: "11-r",
      instruction: "Fix the typo: replace the `u` with an `a` using `r`.",
      startText: "bug",
      startCursor: { line: 0, col: 1 },
      targetText: "bag",
      par: 2,
      hint: "ra",
    },
    {
      kind: "challenge",
      id: "11-R",
      instruction: "Overwrite the date: change `2024-01-01` to `2026-07-15` with one `R` session.",
      startText: "2024-01-01",
      startCursor: { line: 0, col: 2 },
      targetText: "2026-07-15",
      requireNormal: true,
      par: 10,
      hint: "R 26-07-15 <Esc>",
    },
    {
      kind: "challenge",
      id: "11-tilde",
      instruction: "Uppercase `vim` with `~` (it moves right after each toggle).",
      startText: "vim",
      startCursor: { line: 0, col: 0 },
      targetText: "VIM",
      par: 3,
      hint: "~ ~ ~",
    },
    {
      kind: "challenge",
      id: "11-J",
      instruction: "Join the two lines into one with `J`.",
      startText: "same\nline",
      startCursor: { line: 0, col: 0 },
      targetText: "same line",
      par: 1,
      hint: "J",
    },
    {
      kind: "explanation",
      text: "Two more you'll use constantly: `u` undoes the last change and `Ctrl-r` redoes it. Try them on any challenge — make a mess, `u` it away, then Reset if needed. (No graded challenge here: an undo round-trip ends where it started.)",
    },
  ],
};
