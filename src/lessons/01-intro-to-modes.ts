import type { Lesson } from "./types";

export const lesson: Lesson = {
  id: "01-intro-to-modes",
  title: "Intro to Modes",
  section: "Fundamentals",
  order: 1,
  steps: [
    {
      kind: "explanation",
      text: "Vim is a modal editor. In **normal mode** keys run commands; in **insert mode** keys type text. You start in normal mode. Press `i` to insert before the cursor, and `<Esc>` to go back to normal mode. The current mode is shown below the editor.",
    },
    {
      kind: "challenge",
      id: "01-type-hello",
      instruction: "Enter insert mode with `i`, type `hello`, then press `<Esc>` to return to normal mode.",
      startText: "",
      startCursor: { line: 0, col: 0 },
      targetText: "hello",
      requireNormal: true,
      par: 7,
      hint: "i, then h-e-l-l-o, then <Esc>. 7 keystrokes total.",
    },
    {
      kind: "explanation",
      text: "`a` also enters insert mode, but **after** the cursor — handy for appending. You'll drill more insert commands soon; for now, just try it.",
    },
    {
      kind: "challenge",
      id: "01-append-bang",
      instruction: "The cursor is on the last character. Append `!` to the end of the line using `a`, then return to normal mode.",
      startText: "learning vim",
      startCursor: { line: 0, col: 11 },
      targetText: "learning vim!",
      requireNormal: true,
      par: 3,
      hint: "a ! <Esc>",
    },
    {
      kind: "challenge",
      id: "01-insert-mid",
      instruction: "Insert `very ` before `good` (cursor is already on the `g`), then return to normal mode.",
      startText: "vim is good",
      startCursor: { line: 0, col: 7 },
      targetText: "vim is very good",
      requireNormal: true,
      par: 7,
      hint: "i, type `very `, <Esc>",
    },
  ],
};
