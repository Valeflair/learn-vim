import { mulberry32, shuffle } from "../lessons/gen";
import type { Cursor, Lesson, Task } from "../lessons/types";

export type DrillResult = { timeMs: number; keystrokes: number };

export type DrillState = "idle" | "running" | "finished";

/**
 * One run through a lesson: `taskCount` randomized tasks sampled from the
 * lesson's generators. The clock starts on the first keystroke; every key
 * (including Esc and ctrl chords) counts toward the keystroke total.
 */
export class Drill {
  readonly tasks: Task[];
  private index = 0;
  private keys = 0;
  private startedAt: number | null = null;
  private finishedAt: number | null = null;

  constructor(lesson: Lesson, seed: number) {
    const rng = mulberry32(seed);
    const tasks: Task[] = [];
    // Cycle through the generators in a shuffled order so every drill mixes
    // the lesson's new keys with review, but no generator dominates.
    let order = shuffle(rng, lesson.generators);
    let i = 0;
    while (tasks.length < lesson.taskCount) {
      if (i >= order.length) {
        order = shuffle(rng, lesson.generators);
        i = 0;
      }
      tasks.push(order[i++](rng));
    }
    this.tasks = tasks;
  }

  get state(): DrillState {
    if (this.finishedAt !== null) return "finished";
    if (this.startedAt !== null) return "running";
    return "idle";
  }

  get current(): Task {
    return this.tasks[Math.min(this.index, this.tasks.length - 1)];
  }

  get taskIndex(): number {
    return this.index;
  }

  get total(): number {
    return this.tasks.length;
  }

  get keystrokes(): number {
    return this.keys;
  }

  /** Count a keystroke; the first one starts the clock. */
  recordKey(now: number = Date.now()): void {
    if (this.finishedAt !== null) return;
    if (this.startedAt === null) this.startedAt = now;
    this.keys++;
  }

  elapsedMs(now: number = Date.now()): number {
    if (this.startedAt === null) return 0;
    return (this.finishedAt ?? now) - this.startedAt;
  }

  /** Does the editor state complete the current task? */
  check(text: string, cursor: Cursor, mode: string): boolean {
    const t = this.current;
    if (text !== t.targetText) return false;
    if (t.requireNormal && mode !== "normal") return false;
    if (t.targetCursor) {
      if (cursor.line !== t.targetCursor.line || cursor.col !== t.targetCursor.col) return false;
    }
    return true;
  }

  /** Move to the next task; the last advance stops the clock. */
  advance(now: number = Date.now()): void {
    if (this.finishedAt !== null) return;
    this.index++;
    if (this.index >= this.tasks.length) {
      this.finishedAt = now;
      if (this.startedAt === null) this.startedAt = now;
    }
  }

  result(): DrillResult | null {
    if (this.finishedAt === null || this.startedAt === null) return null;
    return { timeMs: this.finishedAt - this.startedAt, keystrokes: this.keys };
  }
}

/** A fresh random seed for a drill run. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}
