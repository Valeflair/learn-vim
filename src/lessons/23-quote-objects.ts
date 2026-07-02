import type { Lesson } from "./types";
import { deleteInsidePair, changeInsidePair, deleteAroundPair } from "./gen";

export const lesson: Lesson = {
  id: "23-quote-objects",
  title: "Quotes",
  section: "Text Objects",
  order: 23,
  intro: [
    "Strings get their own text objects: `di\"` deletes the contents of the double-quoted string the cursor is in, `ci\"` changes them, `da\"` removes the string including its quotes.",
    "As with brackets, the cursor only needs to be **somewhere inside** — Vim finds the enclosing quotes for you. It even works with the cursor before the string on the same line.",
    "`ci\"` is the classic: change a string literal without touching the quotes. You will use it daily.",
  ],
  keys: [
    { keys: 'di"', label: "delete inside quotes" },
    { keys: 'ci"', label: "change inside quotes" },
    { keys: 'da"', label: "delete around quotes" },
  ],
  taskCount: 10,
  generators: [deleteInsidePair('"'), changeInsidePair('"'), deleteAroundPair('"')],
};
