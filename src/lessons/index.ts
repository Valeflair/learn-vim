import type { Lesson, TaskGen } from "./types";
import { lesson as l01 } from "./01-intro-to-modes";
import { lesson as l02 } from "./02-basic-movement";
import { lesson as l03 } from "./03-moving-by-words";
import { lesson as l04 } from "./04-insert-mode";
import { lesson as l05 } from "./05-insert-at-line-ends";
import { lesson as l06 } from "./06-opening-new-lines";
import { lesson as l07 } from "./07-making-small-edits";
import { lesson as l08 } from "./08-moving-by-big-words";
import { lesson as l09 } from "./09-line-ends";
import { lesson as l10 } from "./10-find-character";
import { lesson as l11 } from "./11-till-character";
import { lesson as l12 } from "./12-delete-words";
import { lesson as l13 } from "./13-change-words";
import { lesson as l14 } from "./14-delete-lines";
import { lesson as l15 } from "./15-copy-paste-lines";
import { lesson as l16 } from "./16-repeat-and-join";
import { lesson as l17 } from "./17-relative-jumps";
import { lesson as l18 } from "./18-absolute-jumps";
import { lesson as l19 } from "./19-paragraph-jumps";
import { lesson as l20 } from "./20-search";
import { lesson as l21 } from "./21-quick-word-search";
import { lesson as l22 } from "./22-bracket-objects";
import { lesson as l23 } from "./23-quote-objects";
import { lesson as l24 } from "./24-word-paragraph-objects";
import { lesson as l25 } from "./25-visual-mode";
import { lesson as l26 } from "./26-visual-line";
import { lesson as l27 } from "./27-moving-lines";
import { lesson as l28 } from "./28-marks";
import { lesson as l29 } from "./29-macros";

export const lessons: Lesson[] = [
  l01, l02, l03, l04, l05, l06, l07, l08, l09, l10,
  l11, l12, l13, l14, l15, l16, l17, l18, l19, l20,
  l21, l22, l23, l24, l25, l26, l27, l28, l29,
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function adjacentLessons(id: string): { prev?: Lesson; next?: Lesson } {
  const i = lessons.findIndex((l) => l.id === id);
  if (i < 0) return {};
  return { prev: lessons[i - 1], next: lessons[i + 1] };
}

export type Chapter = { name: string; slug: string; lessons: Lesson[] };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Lessons grouped by section, in curriculum order. */
export function chapters(): Chapter[] {
  const out: Chapter[] = [];
  for (const lesson of lessons) {
    const last = out[out.length - 1];
    if (last?.name === lesson.section) last.lessons.push(lesson);
    else out.push({ name: lesson.section, slug: slugify(lesson.section), lessons: [lesson] });
  }
  return out;
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters().find((c) => c.slug === slug);
}

/**
 * Revision pools exclude lessons on custom snippets — their generators
 * (macros, o/O) aren't safe or sensible on the shared code snippets.
 */
export function chapterPool(ch: Chapter): TaskGen[] {
  return ch.lessons.filter((l) => !l.snippets).flatMap((l) => l.generators);
}

export function cumulativePool(ch: Chapter): TaskGen[] {
  const lastOrder = ch.lessons[ch.lessons.length - 1]!.order;
  return lessons.filter((l) => l.order <= lastOrder && !l.snippets).flatMap((l) => l.generators);
}
