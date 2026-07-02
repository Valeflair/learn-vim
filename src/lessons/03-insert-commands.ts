import type { Lesson } from "./types";
import { typeFresh, insertMissing, appendEnd, insertStart, openLine, gridMove } from "./gen";

export const lesson: Lesson = {
  id: "03-insert-commands",
  title: "Insert Commands",
  section: "Basics",
  order: 3,
  intro: [
    "`i` is only one of six ways into insert mode, and picking the right one saves you a trip. `a` appends **after** the cursor; `A` jumps to the **end of the line** and appends there; `I` jumps to the first non-blank character and inserts.",
    "`o` opens a brand-new line **below** the cursor and drops you into insert mode on it; `O` opens the line **above**. No manual navigation to the line end, no pressing Enter — one key does it all.",
    "Each task tells you what text to produce. Pick the entry command that starts you in the right spot, type, and `Esc` out.",
  ],
  keys: [
    { keys: "i / a", label: "insert before / after the cursor" },
    { keys: "I / A", label: "insert at line start / line end" },
    { keys: "o / O", label: "open a new line below / above" },
    { keys: "Esc", label: "back to normal mode" },
  ],
  taskCount: 10,
  generators: [
    typeFresh(),
    insertMissing(),
    appendEnd(),
    insertStart(),
    openLine("o"),
    openLine("O"),
    gridMove(),
  ],
};
