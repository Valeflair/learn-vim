export type Cursor = { line: number; col: number };

/** Character range to highlight in the start text (cols [from, to) on one line). */
export type TaskMark = { line: number; from: number; to: number };

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
  /** Red "delete/change this" highlights in the start text. */
  marks?: TaskMark[];
  /** Task only completes back in normal mode (for insert-mode tasks). */
  requireNormal?: boolean;
};

export type Rng = () => number;
export type TaskGen = (rng: Rng) => Task;

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
  /** Task generators: the lesson's new keys plus review of earlier ones. */
  generators: TaskGen[];
};
