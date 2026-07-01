import type { Lesson } from "./types";
import { lesson as l01 } from "./01-intro-to-modes";
import { lesson as l02 } from "./02-basic-movement";
import { lesson as l03 } from "./03-insert-commands";

export const lessons: Lesson[] = [l01, l02, l03];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
