import type { Lesson } from "./types";
import { deleteInsidePair, changeInsidePair, deleteAroundPair } from "./gen";

export const lesson: Lesson = {
  id: "23-quote-objects",
  title: "Quotes",
  section: "Text Objects",
  order: 23,
  intro: [
    "`di\"` deletes the content of the surrounding double-quoted string, `ci\"` changes it, `da\"` deletes it with the quotes.",
    "The cursor only has to be somewhere inside the string.",
  ],
  keys: [
    { keys: 'di"', label: "delete inside quotes" },
    { keys: 'ci"', label: "change inside quotes" },
    { keys: 'da"', label: "delete around quotes" },
  ],
  taskCount: 10,
  generators: [deleteInsidePair('"'), changeInsidePair('"'), deleteAroundPair('"')],
};
