import type { Challenge, Cursor } from "../lessons/types";

export class Referee {
  keystrokes: string[] = [];
  solved = false;

  constructor(private challenge: Challenge) {}

  onKey(key: string): void {
    if (this.solved) return;
    this.keystrokes.push(key);
  }

  check(text: string, cursor: Cursor, mode: string): boolean {
    if (this.solved) return true;
    const c = this.challenge;
    if (text !== c.targetText) return false;
    if (c.targetCursor && (cursor.line !== c.targetCursor.line || cursor.col !== c.targetCursor.col)) return false;
    if (c.requireNormal && mode !== "normal") return false;
    this.solved = true;
    return true;
  }

  get count(): number {
    return this.keystrokes.length;
  }

  get underPar(): boolean {
    return this.count <= this.challenge.par;
  }

  reset(): void {
    this.keystrokes = [];
    this.solved = false;
  }
}
