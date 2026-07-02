const KEY = "learn-vim-progress-v2";

export type DrillRecord = {
  done: boolean;
  bestTimeMs: number;
  bestKeystrokes: number;
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

/** Record a finished drill; keeps the best time and best keystrokes separately. */
export function recordResult(lessonId: string, timeMs: number, keystrokes: number): void {
  const data = loadProgress();
  const prev = data.lessons[lessonId];
  data.lessons[lessonId] = {
    done: true,
    bestTimeMs: prev ? Math.min(prev.bestTimeMs, timeMs) : timeMs,
    bestKeystrokes: prev ? Math.min(prev.bestKeystrokes, keystrokes) : keystrokes,
  };
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
