import type { Lesson } from "./types";
import { lesson as l01 } from "./01-intro-to-modes";
import { lesson as l02 } from "./02-basic-movement";
import { lesson as l03 } from "./03-insert-commands";
import { lesson as l04 } from "./04-word-motions";
import { lesson as l05 } from "./05-line-navigation";
import { lesson as l06 } from "./06-find-on-line";
import { lesson as l07 } from "./07-vertical-movement";
import { lesson as l08 } from "./08-deleting";
import { lesson as l09 } from "./09-change-yank-put";
import { lesson as l10 } from "./10-operator-grammar";
import { lesson as l11 } from "./11-replace-misc";

export const lessons: Lesson[] = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
