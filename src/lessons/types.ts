export type Cursor = { line: number; col: number };

/**
 * Character range to highlight in the start text (cols [from, to) on one line).
 * "del" (default) renders red: text to remove or change. "focus" renders blue:
 * the line or span the task operates on (so instructions never need absolute
 * line numbers, which the hybrid gutter hides).
 */
export type TaskMark = { line: number; from: number; to: number; kind?: "del" | "focus" };

/** Inline hint showing text that is missing from the start text (green dashed box). */
export type TaskGhost = { line: number; col: number; text: string };

/** One randomized micro-task inside a drill. */
export type Task = {
  /** Shown above the editor; backticks render as keycaps. */
  instruction: string;
  /** The key(s) this task drills, e.g. "daw". Shown as a hint chip. */
  keyHint?: string;
  startText: string;
  startCursor: Cursor;
  targetText: string;
  /** When set, the task also requires the cursor to land here (shown as a green cell). */
  targetCursor?: Cursor;
  /** Highlights in the start text (red = remove/change, blue = act here). */
  marks?: TaskMark[];
  /** Missing text rendered as a ghost box at its insertion point. */
  ghost?: TaskGhost;
  /** Task only completes back in normal mode (for insert-mode tasks). */
  requireNormal?: boolean;
};

export type Rng = () => number;

/**
 * Builds one task from the drill's base snippet. All tasks of a drill run share
 * the same snippet; each generator perturbs or targets a different spot in it.
 */
export type TaskGen = (rng: Rng, base: readonly string[]) => Task;

/** One entry in the always-visible key reference panel. */
export type KeyDoc = { keys: string; label: string };

export type Lesson = {
  id: string;
  title: string;
  section: string;
  order: number;
  /** Explanation paragraphs, visible while drilling. Backticks render as code. */
  intro: string[];
  /** Keys taught in this lesson. */
  keys: KeyDoc[];
  /** Number of tasks in one drill run. */
  taskCount: number;
  /** Task generators: only the keys this lesson teaches. */
  generators: TaskGen[];
  /** Base-text pool for drills; defaults to the shared code snippets. */
  snippets?: readonly (readonly string[])[];
};
