import type { Lesson } from "./types";
import { searchWord } from "./gen";

export const lesson: Lesson = {
  id: "21-quick-word-search",
  title: "Quick Word Search",
  section: "Search",
  order: 21,
  intro: [
    "`*` searches for the word under the cursor, `#` backwards. Matches whole words only: `count` does not stop inside `counter`.",
    "`n` and `N` walk through the matches afterwards.",
  ],
  keys: [
    { keys: "*", label: "next occurrence of word under cursor" },
    { keys: "#", label: "previous occurrence" },
  ],
  taskCount: 8,
  generators: [searchWord("*"), searchWord("#")],
};
