import type { Lesson } from "./types";
import { searchWord, searchSlash } from "./gen";

export const lesson: Lesson = {
  id: "21-quick-word-search",
  title: "Quick Word Search",
  section: "Search",
  order: 21,
  intro: [
    "`*` searches for the **word under the cursor** — no typing at all. Cursor on a variable name, press `*`, and you jump to its next use. `#` does the same backwards.",
    "It matches whole words only, so `count` will not stop inside `counter`. This is the fastest \"where else is this used?\" in Vim.",
    "After a `*`, the ordinary `n` and `N` keep walking through the occurrences. Chase the highlighted occurrence in these tasks.",
  ],
  keys: [
    { keys: "*", label: "next occurrence of word under cursor" },
    { keys: "#", label: "previous occurrence" },
  ],
  taskCount: 8,
  generators: [searchWord("*"), searchWord("#"), searchSlash()],
};
