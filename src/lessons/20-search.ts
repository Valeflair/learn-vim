import type { Lesson } from "./types";
import { searchSlash } from "./gen";

export const lesson: Lesson = {
  id: "20-search",
  title: "Search",
  section: "Search",
  order: 20,
  intro: [
    "`/` starts a search: type part of a word, press `Enter`, and the cursor jumps to the next match. `n` repeats forward, `N` backwards. Search wraps at the end of the file.",
    "Two or three characters are usually enough.",
  ],
  keys: [
    { keys: "/{text}", label: "search forward for text" },
    { keys: "n", label: "next match" },
    { keys: "N", label: "previous match" },
  ],
  taskCount: 8,
  generators: [searchSlash()],
};
