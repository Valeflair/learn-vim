import type { Lesson } from "./types";
import { replaceChar, toggleCase, joinLines, deleteChar, changeWord } from "./gen";

export const lesson: Lesson = {
  id: "11-replace-misc",
  title: "Small Edits",
  section: "Editing",
  order: 11,
  intro: [
    "Some edits are too small for insert mode. `r` followed by any character **replaces** the character under the cursor and leaves you in normal mode: cursor on a typo, `rx` fixes it in two keys.",
    "`~` toggles the case of the character under the cursor and steps right — great for fixing capitalization.",
    "`J` joins the line below onto the end of the current line, inserting a single space. Splitting a sentence back together is one keystroke.",
  ],
  keys: [
    { keys: "r{char}", label: "replace the character under the cursor" },
    { keys: "~", label: "toggle case of the character" },
    { keys: "J", label: "join the next line onto this one" },
  ],
  taskCount: 10,
  generators: [replaceChar(), toggleCase(), joinLines(), deleteChar(), changeWord()],
};
