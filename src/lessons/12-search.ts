import type { Lesson } from "./types";
import { searchWord, paraJump, gotoLine } from "./gen";

export const lesson: Lesson = {
  id: "12-search",
  title: "Search",
  section: "Search & Objects",
  order: 12,
  intro: [
    "The fastest way to a distant word is to search for it. `/pattern` then `Enter` jumps forward to the next match; `n` repeats the search, `N` goes the other way.",
    "Even faster when the word is already under your cursor: `*` searches **forward** for the word under the cursor, `#` searches backward. No typing the word at all.",
    "In these drills, put the cursor on a highlighted word and let `*` and `#` carry you between its occurrences.",
  ],
  keys: [
    { keys: "*", label: "search forward for the word under cursor" },
    { keys: "#", label: "search backward for the word under cursor" },
    { keys: "/pattern", label: "search forward for a pattern" },
    { keys: "n / N", label: "next / previous match" },
  ],
  taskCount: 8,
  generators: [searchWord("*"), searchWord("#"), paraJump(), gotoLine()],
};
