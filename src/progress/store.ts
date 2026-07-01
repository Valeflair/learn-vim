import type { Lesson } from "../lessons/types";

const KEY = "learn-vim-progress-v1";

export type ProgressData = {
  version: 1;
  challenges: Record<string, { done: boolean; bestKeystrokes: number }>;
};

function empty(): ProgressData {
  return { version: 1, challenges: {} };
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (data?.version !== 1 || typeof data.challenges !== "object" || data.challenges === null) return empty();
    return data;
  } catch {
    return empty();
  }
}

export function recordResult(challengeId: string, keystrokes: number): void {
  const data = loadProgress();
  const prev = data.challenges[challengeId];
  data.challenges[challengeId] = {
    done: true,
    bestKeystrokes: prev ? Math.min(prev.bestKeystrokes, keystrokes) : keystrokes,
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function isChallengeDone(id: string): boolean {
  return loadProgress().challenges[id]?.done ?? false;
}

export function lessonProgress(lesson: Lesson): "none" | "partial" | "done" {
  const ids = lesson.steps.filter((s) => s.kind === "challenge").map((s) => s.id);
  if (ids.length === 0) return "done";
  const done = ids.filter(isChallengeDone).length;
  if (done === 0) return "none";
  return done === ids.length ? "done" : "partial";
}
