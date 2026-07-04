const KEY = "learn-vim-progress-v2";

export type RunRecord = {
  at: number;
  timeMs: number;
  keystrokes: number;
  /** Run was a chapter/cumulative revision drill, not the lesson itself; excluded from bests. */
  revised?: boolean;
};

export type DrillRecord = {
  done: boolean;
  /** null until a non-revised run sets a best. */
  bestTimeMs: number | null;
  bestKeystrokes: number | null;
  runs?: RunRecord[];
};

export type ProgressData = {
  version: 2;
  lessons: Record<string, DrillRecord>;
};

function empty(): ProgressData {
  return { version: 2, lessons: {} };
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (data?.version !== 2 || typeof data.lessons !== "object" || data.lessons === null) return empty();
    return data;
  } catch {
    return empty();
  }
}

/**
 * Record a finished drill: appends to the run history (capped) and keeps the
 * best time and best keystrokes separately. Revision runs (chapter or
 * cumulative pools) never update the bests of a normal lesson run.
 */
export function recordResult(lessonId: string, timeMs: number, keystrokes: number, revised = false): void {
  const data = loadProgress();
  const prev = data.lessons[lessonId];
  const run: RunRecord = { at: Date.now(), timeMs, keystrokes };
  if (revised) run.revised = true;
  const runs = [...(prev?.runs ?? []), run].slice(-50);
  const bestTimeMs = revised ? (prev?.bestTimeMs ?? null) : Math.min(prev?.bestTimeMs ?? Infinity, timeMs);
  const bestKeystrokes = revised
    ? (prev?.bestKeystrokes ?? null)
    : Math.min(prev?.bestKeystrokes ?? Infinity, keystrokes);
  data.lessons[lessonId] = { done: true, bestTimeMs, bestKeystrokes, runs };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function lessonRecord(lessonId: string): DrillRecord | null {
  return loadProgress().lessons[lessonId] ?? null;
}

export function isLessonDone(lessonId: string): boolean {
  return lessonRecord(lessonId)?.done ?? false;
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
