import type { Lesson } from "./types";
import { deleteWord, changeWord, deleteInsidePara, deleteAroundPara } from "./gen";

export const lesson: Lesson = {
  id: "24-word-paragraph-objects",
  title: "Words & Paragraphs",
  section: "Text Objects",
  order: 24,
  intro: [
    "Words and paragraphs are text objects too. You already met `daw` and `ciw`; the same grammar scales up: `ip` is the paragraph the cursor is in (the block between blank lines), `ap` includes the blank line after it.",
    "`dip` deletes every line of the current block and leaves the blank separators. `dap` deletes the block **and** its trailing blank line — the whole logical unit disappears cleanly.",
    "That is the full pattern: operator + `i`/`a` + object. Once it clicks, you can guess commands you have never typed before.",
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
