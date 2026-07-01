import type { Lesson } from "./types";

export const lesson: Lesson = {
  id: "14-visual-mode",
  title: "Visual Mode (v V Ctrl-v)",
  section: "Text objects & Visual mode",
  order: 14,
  steps: [
    {
      kind: "explanation",
      text: "`v` starts character-wise selection, `V` line-wise, `Ctrl-v` block-wise. Extend the selection with any motion, then hit an operator (`d`, `y`, `c`). `o` jumps the cursor to the other end of the selection so you can extend both ways.",
    },
    {
      kind: "challenge",
      id: "14-v-d",
      instruction: "Select `TWO THREE` with `v` + `e` motions, then delete the selection.",
      startText: "one TWO THREE four",
      startCursor: { line: 0, col: 4 },
      targetText: "one  four",
      par: 4,
      hint: "v e e d",
    },
    {
      kind: "challenge",
      id: "14-V-d",
      instruction: "Delete the three `del` lines with one line-wise selection.",
      startText: "keep\ndel1\ndel2\ndel3\nkeep",
      startCursor: { line: 1, col: 0 },
      targetText: "keep\nkeep",
      par: 4,
      hint: "V j j d",
    },
    {
      kind: "challenge",
      id: "14-o",
      instruction: "The cursor starts in the **middle** `del` line. Select all three with `V`, `k`, then `o` to extend the other way, and delete.",
      startText: "keep\ndel1\ndel2\ndel3\nkeep",
      startCursor: { line: 2, col: 0 },
      targetText: "keep\nkeep",
      par: 5,
      hint: "V k o j d",
    },
    {
      kind: "challenge",
      id: "14-block",
      instruction: "Delete the `#` column from all three lines with a block selection.",
      startText: "#one\n#two\n#three",
      startCursor: { line: 0, col: 0 },
      targetText: "one\ntwo\nthree",
      par: 4,
      hint: "<C-v> j j x",
    },
  ],
};
