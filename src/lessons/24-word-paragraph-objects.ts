import type { Lesson } from "./types";
import { deleteWord, changeWord, deleteInsidePara, deleteAroundPara } from "./gen";

export const lesson: Lesson = {
  id: "24-word-paragraph-objects",
  title: "Words & Paragraphs",
  section: "Text Objects",
  order: 24,
  intro: [
    "Paragraphs are text objects too: `ip` is the block between blank lines, `ap` includes the trailing blank line. `dip` clears the block, `dap` removes it entirely.",
    "The pattern is always operator, `i` or `a`, object.",
  ],
  keys: [
    { keys: "daw", label: "delete a word" },
    { keys: "ciw", label: "change inner word" },
    { keys: "dip", label: "delete inner paragraph" },
    { keys: "dap", label: "delete a paragraph" },
  ],
  taskCount: 10,
  generators: [deleteWord("daw"), changeWord("ciw"), deleteInsidePara(), deleteAroundPara()],
};
