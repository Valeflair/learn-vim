import type { Lesson } from "./types";
import { searchSlash, findChar } from "./gen";

export const lesson: Lesson = {
  id: "20-search",
  title: "Search",
  section: "Search",
  order: 20,
  intro: [
    "`/` opens search: type a word, press `Enter`, and the cursor jumps to the next match. It is the universal long-range motion — when the target is far away, searching beats any number of `w`s and `j`s.",
    "`n` repeats the search forward, `N` backwards. Search wraps around the end of the file, so you can never overshoot for good.",
    "Type only as much as is unique: two or three characters usually suffice. Search is also a motion (`d/foo` exists), but first make jumping second nature.",
  ],
  keys: [
    { keys: "/{text}", label: "search forward for text" },
    { keys: "n", label: "next match" },
    { keys: "N", label: "previous match" },
  ],
  taskCount: 8,
  generators: [searchSlash(), findChar("f")],
};
