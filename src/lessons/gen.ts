import type { Cursor, Rng, Task, TaskGen, TaskMark } from "./types";

// ---------------------------------------------------------------------------
// Randomness helpers
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  return shuffle(rng, arr).slice(0, n);
}

// ---------------------------------------------------------------------------
// Base snippets
//
// Every drill run picks ONE snippet; all its tasks perturb or target spots in
// that same text (like vim-hero). Each default snippet guarantees, so every
// generator always finds a candidate: a blank line away from the edges, two or
// more double-quoted strings (one with no space touching the quotes), inline
// (), {} and [] pairs, indented lines, and top-level lines whose neighbor is
// top-level or blank.
// ---------------------------------------------------------------------------

export type Snippet = readonly string[];

export const SNIPPETS: Snippet[] = [
  [
    "function describeCart(cart) {",
    "  const items = cart.filter(x => x.count > 0);",
    '  const label = items.length + " items";',
    "  return { label: label, size: items.length };",
    "}",
    "",
    'console.log("cart", describeCart(["kiwi"]));',
  ],
  [
    'const config = { theme: "dark", size: 14 };',
    'const users = ["ada", "linus", "grace"];',
    "",
    "function activeUsers(list) {",
    "  const found = list.filter(u => u.active);",
    '  console.log("active", found.length);',
    "  return found;",
    "}",
  ],
  [
    "function parseLine(raw) {",
    '  const parts = raw.trim().split(",");',
    '  const key = parts[0] || "empty";',
    "  return { key: key, rest: parts.slice(1) };",
    "}",
    "",
    'const demo = parseLine("mode,dark,wide");',
    "console.log(demo.key, demo.rest);",
  ],
  [
    "let score = 0;",
    'const words = ["vim", "motion", "buffer"];',
    "",
    "for (const word of words) {",
    "  if (word.length > 3) {",
    "    score += word.length;",
    "  }",
    "  console.log({ word: word, score: score });",
    "}",
  ],
  [
    'const state = { mode: "normal", count: 0 };',
    "",
    "function setMode(next) {",
    "  const prev = state.mode;",
    "  state.mode = next;",
    '  console.log("mode:", prev, "->", next);',
    "  return [prev, next];",
    "}",
  ],
  [
    "function clamp(value, low, high) {",
    "  if (value < low) return low;",
    "  if (value > high) return high;",
    "  return value;",
    "}",
    "",
    "const sizes = [clamp(4, 1, 3), clamp(9, 5, 8)];",
    'console.log("sizes", sizes, { unit: "px" });',
  ],
];

/** Uniform plain lines for macro drills (same edit on every line). */
export const LIST_SNIPPETS: Snippet[] = [
  ["north gate", "south gate", "east tower", "west tower"],
  ["copper wire", "silver bell", "golden ring", "woven rope", "carved stone"],
  ["red panda", "blue heron", "gray wolf", "green finch"],
  ["dark roast", "light roast", "cold brew", "flat white"],
];

/** Replacement / junk identifiers inserted into snippets. */
const WORDS = [
  "widget", "cursor", "buffer", "margin", "render", "stream", "packet",
  "kernel", "branch", "commit", "vector", "module", "socket", "thread",
  "parser", "signal", "quartz", "copper", "harbor", "pebble", "timber",
  "willow", "ember", "summit", "cinder", "marble", "cobalt", "velvet",
];

// ---------------------------------------------------------------------------
// Snippet scanning helpers
// ---------------------------------------------------------------------------

type Span = { line: number; from: number; to: number; word: string };

const WORD_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

function fail(what: string): never {
  throw new Error(`generator found no candidate: ${what}`);
}

function need<T>(arr: T[], what: string): T[] {
  if (arr.length === 0) fail(what);
  return arr;
}

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function nonBlankLines(lines: Snippet): number[] {
  return lines.map((_, i) => i).filter((i) => !isBlank(lines[i]));
}

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

/** Identifier spans on one line, at least minLen chars long. */
function lineSpans(lines: Snippet, li: number, minLen = 3): Span[] {
  const spans: Span[] = [];
  for (const m of lines[li].matchAll(WORD_RE)) {
    if (m[0].length >= minLen) {
      spans.push({ line: li, from: m.index, to: m.index + m[0].length, word: m[0] });
    }
  }
  return spans;
}

function allSpans(lines: Snippet, minLen = 3): Span[] {
  return lines.flatMap((_, li) => lineSpans(lines, li, minLen));
}

/** Spans that sit on a clean word boundary (start of line content or after a space). */
function boundarySpans(lines: Snippet, minLen = 3): Span[] {
  return allSpans(lines, minLen).filter(
    (s) => s.from === indentOf(lines[s.line]) || lines[s.line][s.from - 1] === " ",
  );
}

function replaceRange(lines: Snippet, li: number, from: number, to: number, text: string): string[] {
  const out = [...lines];
  out[li] = out[li].slice(0, from) + text + out[li].slice(to);
  return out;
}

function text(lines: Snippet): string {
  return lines.join("\n");
}

/** Task that restores the pristine snippet from a perturbed copy. */
function restore(
  base: Snippet,
  perturbed: readonly string[],
  rest: Omit<Task, "startText" | "targetText" | "startCursor"> & { startCursor?: Cursor },
): Task {
  return {
    startText: text(perturbed),
    startCursor: rest.startCursor ?? { line: 0, col: 0 },
    targetText: text(base),
    ...rest,
  };
}

/** Task that edits the pristine snippet into a modified version. */
function modify(
  base: Snippet,
  target: readonly string[],
  rest: Omit<Task, "startText" | "targetText" | "startCursor"> & { startCursor?: Cursor },
): Task {
  return {
    startText: text(base),
    startCursor: rest.startCursor ?? { line: 0, col: 0 },
    targetText: text(target),
    ...rest,
  };
}

// ---------------------------------------------------------------------------
// Movement generators (green target cell, text unchanged)
// ---------------------------------------------------------------------------

function motionTask(base: Snippet, from: Cursor, to: Cursor, instruction: string, keyHint: string): Task {
  return {
    instruction,
    keyHint,
    startText: text(base),
    startCursor: from,
    targetText: text(base),
    targetCursor: to,
  };
}

/** hjkl practice: move to a highlighted cell somewhere in the snippet. */
export function gridMove(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const la = pick(rng, nb);
    const far = need(nb.filter((l) => Math.abs(l - la) >= 2), "gridMove far line");
    const lb = pick(rng, far);
    const ca = int(rng, 0, Math.max(0, base[la].length - 1));
    const cb = int(rng, indentOf(base[lb]), Math.max(0, base[lb].length - 1));
    return motionTask(base, { line: la, col: ca }, { line: lb, col: cb },
      "Move the cursor onto the highlighted cell", "hjkl");
  };
}

/** {n}j / {n}k: jump straight to a line using a count. */
export function relativeJump(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const la = pick(rng, nb);
    const lb = pick(rng, need(nb.filter((l) => Math.abs(l - la) >= 2), "relativeJump target"));
    const n = Math.abs(lb - la);
    const key = lb > la ? `${n}j` : `${n}k`;
    return motionTask(base, { line: la, col: 0 }, { line: lb, col: 0 },
      `Jump straight to the highlighted line — the relative number in the gutter is the count`, key);
  };
}

/** w / b: jump between word starts on one line. */
export function moveWordStart(): TaskGen {
  return (rng, base) => {
    const lines = need(nonBlankLines(base).filter((li) => lineSpans(base, li).length >= 4), "word line");
    const li = pick(rng, lines);
    const spans = lineSpans(base, li);
    const i = int(rng, 0, spans.length - 1);
    const j = pick(rng, need(spans.map((_, k) => k).filter((k) => Math.abs(k - i) >= 2), "word target"));
    return motionTask(base, { line: li, col: spans[i].from }, { line: li, col: spans[j].from },
      "Hop word by word to the highlighted cell", j > i ? "w" : "b");
  };
}

/** e: jump forward to the end of a word. */
export function moveWordEnd(): TaskGen {
  return (rng, base) => {
    const lines = need(nonBlankLines(base).filter((li) => lineSpans(base, li).length >= 4), "word line");
    const li = pick(rng, lines);
    const spans = lineSpans(base, li);
    let i = int(rng, 0, spans.length - 1);
    let j = pick(rng, need(spans.map((_, k) => k).filter((k) => Math.abs(k - i) >= 2), "word target"));
    if (j < i) [i, j] = [j, i];
    return motionTask(base, { line: li, col: spans[i].from }, { line: li, col: spans[j].to - 1 },
      "Land on the highlighted last letter using word-end hops", "e");
  };
}

/** W / E / B: whitespace-separated WORDs skip over punctuation. */
export function moveBigWord(): TaskGen {
  return (rng, base) => {
    const wordsOf = (li: number) =>
      [...base[li].matchAll(/\S+/g)].map((m) => ({ from: m.index, to: m.index + m[0].length }));
    const lines = need(nonBlankLines(base).filter((li) => wordsOf(li).length >= 3), "WORD line");
    const li = pick(rng, lines);
    const words = wordsOf(li);
    const i = int(rng, 0, words.length - 1);
    const j = pick(rng, need(words.map((_, k) => k).filter((k) => k !== i), "WORD target"));
    const toEnd = j > i && rng() < 0.4;
    const target = toEnd ? words[j].to - 1 : words[j].from;
    return motionTask(base, { line: li, col: words[i].from }, { line: li, col: target },
      "Jump across whole WORDs (punctuation included) to the highlighted cell",
      j > i ? (toEnd ? "E" : "W") : "B");
  };
}

/** 0 / ^ / $: jump to an edge of the line. */
export function moveLineEdge(kind: "0" | "^" | "$"): TaskGen {
  return (rng, base) => {
    const ok = (li: number) =>
      base[li].length >= 8 && (kind !== "^" || indentOf(base[li]) >= 2);
    const li = pick(rng, need(nonBlankLines(base).filter(ok), `line for ${kind}`));
    const line = base[li];
    const indent = indentOf(line);
    let from: number;
    let to: number;
    let instruction: string;
    if (kind === "$") {
      to = line.length - 1;
      from = int(rng, indent, Math.min(indent + 4, line.length - 2));
      instruction = "Jump to the end of the line";
    } else if (kind === "0") {
      to = 0;
      from = int(rng, Math.min(indent + 6, line.length - 1), line.length - 1);
      instruction = "Jump to the very first column of the line";
    } else {
      to = indent;
      from = int(rng, Math.min(indent + 6, line.length - 1), line.length - 1);
      instruction = "Jump to the first character after the indent";
    }
    if (from === to) from = to === 0 ? line.length - 1 : 0;
    return motionTask(base, { line: li, col: from }, { line: li, col: to }, instruction, kind);
  };
}

/** gg / G / nG: jump to the first, last, or a numbered line. */
export function gotoLine(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const first = nb[0];
    const last = nb[nb.length - 1];
    const kind = pick(rng, ["gg", "G", "nG"] as const);
    let target: number;
    let startLine: number;
    let instruction: string;
    let keyHint: string;
    if (kind === "gg") {
      target = first;
      startLine = pick(rng, need(nb.filter((l) => l >= first + 3), "gg start"));
      instruction = "Jump to the first line";
      keyHint = "gg";
    } else if (kind === "G") {
      target = last;
      startLine = pick(rng, need(nb.filter((l) => l <= last - 3), "G start"));
      instruction = "Jump to the last line";
      keyHint = "G";
    } else {
      target = pick(rng, need(nb.filter((l) => l !== first && l !== last), "nG target"));
      startLine = target > (first + last) / 2 ? first : last;
      instruction = `Jump to line ${target + 1}`;
      keyHint = `${target + 1}G`;
    }
    return motionTask(base, { line: startLine, col: 0 }, { line: target, col: indentOf(base[target]) },
      instruction, keyHint);
  };
}

const PUNCT = new Set("=(){}[];.,*+<>|&\"'-".split(""));

function punctuationAt(line: string): Map<string, number[]> {
  const occ = new Map<string, number[]>();
  for (let i = 1; i < line.length - 1; i++) {
    const ch = line[i];
    if (!PUNCT.has(ch)) continue;
    if (!occ.has(ch)) occ.set(ch, []);
    occ.get(ch)!.push(i);
  }
  return occ;
}

/** f / F: land exactly on a character within the line. */
export function findChar(kind: "f" | "F"): TaskGen {
  return (rng, base) => {
    const lines = need(nonBlankLines(base).filter((li) => punctuationAt(base[li]).size > 0), "punct line");
    const li = pick(rng, lines);
    const line = base[li];
    const occ = punctuationAt(line);
    if (kind === "F") {
      const chars = need([...occ.keys()].filter((c) => occ.get(c)![occ.get(c)!.length - 1] < line.length - 1), "F char");
      const ch = pick(rng, chars);
      const idxs = occ.get(ch)!;
      return motionTask(base, { line: li, col: line.length - 1 }, { line: li, col: idxs[idxs.length - 1] },
        `Jump backwards onto the last \`${ch}\` in the line`, `F${ch}`);
    }
    const ch = pick(rng, [...occ.keys()]);
    const idxs = occ.get(ch)!;
    const nth = idxs.length > 1 && rng() < 0.4 ? 1 : 0;
    const which = nth === 0 ? "first" : "second";
    return motionTask(base, { line: li, col: 0 }, { line: li, col: idxs[nth] },
      `Jump onto the ${which} \`${ch}\` in the line`, nth === 0 ? `f${ch}` : `f${ch} ;`);
  };
}

/** t / T: stop just before (or after, backwards) a character. */
export function tillChar(kind: "t" | "T"): TaskGen {
  return (rng, base) => {
    const usable = (li: number) => {
      const occ = punctuationAt(base[li]);
      for (const [ch, idxs] of occ) {
        if (kind === "t" && idxs[0] >= 2) return ch;
        if (kind === "T" && idxs[idxs.length - 1] <= base[li].length - 3) return ch;
      }
      return null;
    };
    const lines = need(nonBlankLines(base).filter((li) => usable(li) !== null), "till line");
    const li = pick(rng, lines);
    const line = base[li];
    const occ = punctuationAt(line);
    if (kind === "T") {
      const chars = need([...occ.keys()].filter((c) => occ.get(c)![occ.get(c)!.length - 1] <= line.length - 3), "T char");
      const ch = pick(rng, chars);
      const idxs = occ.get(ch)!;
      return motionTask(base, { line: li, col: line.length - 1 }, { line: li, col: idxs[idxs.length - 1] + 1 },
        `Move backwards till just after the last \`${ch}\``, `T${ch}`);
    }
    const chars = need([...occ.keys()].filter((c) => occ.get(c)![0] >= 2), "t char");
    const ch = pick(rng, chars);
    return motionTask(base, { line: li, col: 0 }, { line: li, col: occ.get(ch)![0] - 1 },
      `Move till just before the first \`${ch}\``, `t${ch}`);
  };
}

/** { / }: jump between paragraphs (blocks separated by blank lines). */
export function paraJump(): TaskGen {
  return (rng, base) => {
    const blanks = base.map((_, i) => i).filter((i) => isBlank(base[i]));
    const pairs: { start: number; blank: number; hint: string }[] = [];
    for (const b of blanks) {
      for (let s = 0; s < base.length; s++) {
        if (isBlank(base[s])) continue;
        const between = base.slice(Math.min(s, b) + 1, Math.max(s, b)).some(isBlank);
        if (between) continue;
        pairs.push(s < b ? { start: s, blank: b, hint: "}" } : { start: s, blank: b, hint: "{" });
      }
    }
    const p = pick(rng, need(pairs, "paragraph pair"));
    return motionTask(base, { line: p.start, col: 0 }, { line: p.blank, col: 0 },
      p.hint === "}"
        ? "Jump forward to the highlighted blank line between paragraphs"
        : "Jump back to the highlighted blank line between paragraphs",
      p.hint);
  };
}

/** All whole-word occurrences of identifiers that appear more than once. */
function repeatedWords(base: Snippet): Map<string, Cursor[]> {
  const occ = new Map<string, Cursor[]>();
  for (const s of allSpans(base)) {
    if (!occ.has(s.word)) occ.set(s.word, []);
    occ.get(s.word)!.push({ line: s.line, col: s.from });
  }
  for (const [w, list] of occ) {
    if (list.length < 2) occ.delete(w);
  }
  return occ;
}

/** /word: search, land on a match. */
export function searchSlash(): TaskGen {
  return (rng, base) => {
    const occ = repeatedWords(base);
    const words = need([...occ.keys()].filter((w) => {
      const first = occ.get(w)![0];
      return first.line > 0 || first.col > 0;
    }), "search word");
    const word = pick(rng, words);
    const list = occ.get(word)!;
    const second = list.length > 2 && rng() < 0.5;
    return motionTask(base, { line: 0, col: 0 }, second ? list[1] : list[0],
      second
        ? `Search with \`/${word}\` + \`Enter\`, then press \`n\` for the next match`
        : `Search with \`/${word}\` and press \`Enter\``,
      second ? `/${word} n` : `/${word}`);
  };
}

/** * / #: jump to another occurrence of the word under the cursor. */
export function searchWord(dir: "*" | "#"): TaskGen {
  return (rng, base) => {
    const occ = repeatedWords(base);
    const word = pick(rng, need([...occ.keys()], "starred word"));
    const list = occ.get(word)!;
    const i = int(rng, 0, list.length - 1);
    const j = dir === "*" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
    return motionTask(base, list[i], list[j],
      dir === "*"
        ? "Press `*` to jump to the next occurrence of the word under the cursor"
        : "Press `#` to jump to the previous occurrence of the word under the cursor",
      dir);
  };
}

// ---------------------------------------------------------------------------
// Character edits (red mark = wrong text; fix it to restore the snippet)
// ---------------------------------------------------------------------------

/** x: delete a doubled letter. */
export function deleteChar(): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(allSpans(base), "word"));
    const k = int(rng, 1, s.word.length - 1);
    const perturbed = replaceRange(base, s.line, s.from + k, s.from + k, s.word[k - 1]);
    return restore(base, perturbed, {
      instruction: "Delete the highlighted duplicate letter",
      keyHint: "x",
      marks: [{ line: s.line, from: s.from + k, to: s.from + k + 1 }],
    });
  };
}

function wrongChar(rng: Rng, right: string): string {
  return pick(rng, ["x", "z", "q", "k", "w"].filter((c) => c !== right));
}

/** r: overwrite a single wrong letter. */
export function replaceChar(): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(allSpans(base), "word"));
    const k = int(rng, 0, s.word.length - 1);
    const perturbed = replaceRange(base, s.line, s.from + k, s.from + k + 1, wrongChar(rng, s.word[k]));
    return restore(base, perturbed, {
      instruction: `Fix the highlighted letter — it should be \`${s.word[k]}\``,
      keyHint: `r${s.word[k]}`,
      marks: [{ line: s.line, from: s.from + k, to: s.from + k + 1 }],
    });
  };
}

/** s: substitute a wrong letter (delete + insert mode). */
export function substituteChar(): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(allSpans(base), "word"));
    const k = int(rng, 0, s.word.length - 1);
    const perturbed = replaceRange(base, s.line, s.from + k, s.from + k + 1, wrongChar(rng, s.word[k]));
    return restore(base, perturbed, {
      instruction: `Fix the highlighted letter with \`s\` — type \`${s.word[k]}\`, then \`Esc\``,
      keyHint: "s",
      marks: [{ line: s.line, from: s.from + k, to: s.from + k + 1 }],
      requireNormal: true,
    });
  };
}

/** ~: toggle the case of a letter. */
export function toggleCase(): TaskGen {
  return (rng, base) => {
    const spans = need(allSpans(base).filter((s) => /[a-z]/.test(s.word[0])), "lowercase word");
    const s = pick(rng, spans);
    const perturbed = replaceRange(base, s.line, s.from, s.from + 1, s.word[0].toUpperCase());
    return restore(base, perturbed, {
      instruction: "The highlighted letter has the wrong case — toggle it",
      keyHint: "~",
      marks: [{ line: s.line, from: s.from, to: s.from + 1 }],
    });
  };
}

// ---------------------------------------------------------------------------
// Word edits
// ---------------------------------------------------------------------------

/** dw / daw: delete a stray duplicated word. */
export function deleteWord(op: "dw" | "daw"): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(boundarySpans(base), "boundary word"));
    const perturbed = replaceRange(base, s.line, s.from, s.from, s.word + " ");
    return restore(base, perturbed, {
      instruction: "Delete the highlighted repeated word",
      keyHint: op,
      marks: [{ line: s.line, from: s.from, to: s.from + s.word.length + 1 }],
    });
  };
}

/** d2w: delete two stray words at once. */
export function deleteTwoWords(): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(boundarySpans(base), "boundary word"));
    const [j1, j2] = sample(rng, WORDS, 2);
    const junk = `${j1} ${j2} `;
    const perturbed = replaceRange(base, s.line, s.from, s.from, junk);
    return restore(base, perturbed, {
      instruction: "Delete the two highlighted stray words with one command",
      keyHint: "d2w",
      marks: [{ line: s.line, from: s.from, to: s.from + junk.length }],
    });
  };
}

/** cw / ciw: retype a mangled word. */
export function changeWord(op: "cw" | "ciw"): TaskGen {
  return (rng, base) => {
    const s = pick(rng, need(allSpans(base), "word"));
    const junk = pick(rng, WORDS.filter((w) => w !== s.word));
    const perturbed = replaceRange(base, s.line, s.from, s.to, junk);
    return restore(base, perturbed, {
      instruction: `Change the highlighted word to \`${s.word}\`, then \`Esc\``,
      keyHint: op,
      marks: [{ line: s.line, from: s.from, to: s.from + junk.length }],
      requireNormal: true,
    });
  };
}

// ---------------------------------------------------------------------------
// Line edits
// ---------------------------------------------------------------------------

/** dd: delete a duplicated line. */
export function deleteLine(): TaskGen {
  return (rng, base) => {
    const li = pick(rng, nonBlankLines(base));
    const perturbed = [...base.slice(0, li + 1), base[li], ...base.slice(li + 1)];
    return restore(base, perturbed, {
      instruction: "Delete the highlighted duplicated line",
      keyHint: "dd",
      marks: [{ line: li + 1, from: 0, to: base[li].length }],
    });
  };
}

/** dj: delete two stray lines with one command. */
export function deleteLinesDown(): TaskGen {
  return (rng, base) => {
    const p = int(rng, 1, base.length - 1);
    const junk = [`// stray: ${pick(rng, WORDS)}`, `// stray: ${pick(rng, WORDS)}`];
    const perturbed = [...base.slice(0, p), ...junk, ...base.slice(p)];
    return restore(base, perturbed, {
      instruction: "Delete both highlighted stray lines with a single delete-down",
      keyHint: "dj",
      marks: junk.map((l, k) => ({ line: p + k, from: 0, to: l.length })),
    });
  };
}

/** D: delete from the cursor to the end of the line. */
export function deleteToEnd(): TaskGen {
  return (rng, base) => {
    const li = pick(rng, need(nonBlankLines(base).filter((l) => base[l].length >= 10), "long line"));
    const junk = " " + pick(rng, ["// leftover", "@@scratch@@", "<<todo>>"]);
    const perturbed = replaceRange(base, li, base[li].length, base[li].length, junk);
    return restore(base, perturbed, {
      instruction: "Put the cursor on the highlighted junk and delete to the end of the line",
      keyHint: "D",
      marks: [{ line: li, from: base[li].length, to: base[li].length + junk.length }],
    });
  };
}

/** J: rejoin a line that was split in two. */
export function joinLines(): TaskGen {
  return (rng, base) => {
    const candidates: { li: number; s: number }[] = [];
    for (const li of nonBlankLines(base)) {
      const line = base[li];
      const start = indentOf(line);
      for (let s = start + 2; s < line.length - 2; s++) {
        if (line[s] === " " && line[s - 1] !== " " && !")]}".includes(line[s + 1]) && line[s + 1] !== " ") {
          candidates.push({ li, s });
        }
      }
    }
    const c = pick(rng, need(candidates, "join point"));
    const line = base[c.li];
    const perturbed = [
      ...base.slice(0, c.li),
      line.slice(0, c.s),
      line.slice(c.s + 1),
      ...base.slice(c.li + 1),
    ];
    return restore(base, perturbed, {
      instruction: "The highlighted line was split in two — join it back together",
      keyHint: "J",
      marks: [{ line: c.li, from: indentOf(line), to: c.s, kind: "focus" }],
    });
  };
}

/** yy p: duplicate a line in place. */
export function duplicateLine(): TaskGen {
  return (rng, base) => {
    const li = pick(rng, nonBlankLines(base));
    const target = [...base.slice(0, li + 1), base[li], ...base.slice(li + 1)];
    return modify(base, target, {
      instruction: "Duplicate the highlighted line so it appears twice",
      keyHint: "yy p",
      marks: [{ line: li, from: 0, to: base[li].length, kind: "focus" }],
    });
  };
}

/** dd p: push a line one line down. */
export function moveLineDown(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const li = pick(rng, need(nb.filter((l) => l + 1 < base.length && !isBlank(base[l + 1])), "swappable line"));
    const target = [...base];
    [target[li], target[li + 1]] = [target[li + 1], target[li]];
    return modify(base, target, {
      instruction: "Move the highlighted line one line down",
      keyHint: "dd p",
      marks: [{ line: li, from: 0, to: base[li].length, kind: "focus" }],
    });
  };
}

/** yy + p at a distance: copy a line to where the ghost shows. */
export function copyLineTo(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const src = pick(rng, nb);
    const dst = pick(rng, need(nb.filter((l) => Math.abs(l - src) >= 2), "paste target"));
    const target = [...base.slice(0, dst + 1), base[src], ...base.slice(dst + 1)];
    return modify(base, target, {
      instruction: "Copy the highlighted line and paste it below the ghost marker",
      keyHint: "yy p",
      marks: [{ line: src, from: 0, to: base[src].length, kind: "focus" }],
      ghost: { line: dst, col: base[dst].length, text: " ⏎ " + base[src].trim() },
    });
  };
}

/** dd + p at a distance: move a line to where the ghost shows. */
export function moveLineTo(): TaskGen {
  return (rng, base) => {
    const nb = nonBlankLines(base);
    const src = pick(rng, nb);
    const dst = pick(rng, need(nb.filter((l) => l !== src && l !== src - 1 && Math.abs(l - src) >= 2), "move target"));
    const without = base.filter((_, i) => i !== src);
    const at = dst < src ? dst : dst - 1;
    const target = [...without.slice(0, at + 1), base[src], ...without.slice(at + 1)];
    return modify(base, target, {
      instruction: "Move the highlighted line so it sits below the ghost marker",
      keyHint: "dd p",
      marks: [{ line: src, from: 0, to: base[src].length }],
      ghost: { line: dst, col: base[dst].length, text: " ⏎ " + base[src].trim() },
    });
  };
}

/** dw + .: the same stray word on several lines. */
export function dotRepeat(): TaskGen {
  return (rng, base) => {
    const junk = pick(rng, WORDS);
    const byLine = new Map<number, Span[]>();
    for (const s of boundarySpans(base)) {
      if (!byLine.has(s.line)) byLine.set(s.line, []);
      byLine.get(s.line)!.push(s);
    }
    const lines = sample(rng, need([...byLine.keys()], "boundary lines"), 3);
    if (lines.length < 3) fail("three lines for dot repeat");
    lines.sort((a, b) => a - b);
    let perturbed = [...base];
    const marks: TaskMark[] = [];
    for (const li of lines) {
      const s = pick(rng, byLine.get(li)!);
      perturbed = replaceRange(perturbed, li, s.from, s.from, junk + " ");
      marks.push({ line: li, from: s.from, to: s.from + junk.length + 1 });
    }
    return restore(base, perturbed, {
      instruction: "Delete every highlighted word: `dw` on the first, then repeat with `.`",
      keyHint: "dw .",
      marks,
    });
  };
}

// ---------------------------------------------------------------------------
// Insert-mode generators (ghost box = missing text)
// ---------------------------------------------------------------------------

/** i on an empty buffer: type something and get back out. */
export function typeFresh(): TaskGen {
  return (rng) => {
    const phrase = sample(rng, WORDS, 2).join(" ");
    return {
      instruction: `Press \`i\`, type \`${phrase}\`, then press \`Esc\``,
      keyHint: "i",
      startText: "",
      startCursor: { line: 0, col: 0 },
      targetText: phrase,
      requireNormal: true,
    };
  };
}

/** i: restore a missing word where the ghost shows. */
export function insertMissing(): TaskGen {
  return (rng, base) => {
    const spans = need(allSpans(base).filter((s) => base[s.line][s.to] === " "), "removable word");
    const s = pick(rng, spans);
    const perturbed = replaceRange(base, s.line, s.from, s.to + 1, "");
    return restore(base, perturbed, {
      instruction: "Move to the ghost, press `i`, type the missing text, then `Esc`",
      keyHint: "i",
      ghost: { line: s.line, col: s.from, text: s.word + " " },
      requireNormal: true,
    });
  };
}

/** A: restore a missing line ending. */
export function appendEnd(): TaskGen {
  return (rng, base) => {
    const candidates: { li: number; s: number }[] = [];
    for (const li of nonBlankLines(base)) {
      const line = base[li];
      const s = line.lastIndexOf(" ");
      if (s > indentOf(line) + 2 && line.length - s <= 14 && line.length - s >= 3) {
        candidates.push({ li, s });
      }
    }
    const c = pick(rng, need(candidates, "line tail"));
    const tail = base[c.li].slice(c.s);
    const perturbed = replaceRange(base, c.li, c.s, base[c.li].length, "");
    return restore(base, perturbed, {
      instruction: "The line lost its ending — append exactly what the ghost shows, then `Esc`",
      keyHint: "A",
      ghost: { line: c.li, col: c.s, text: tail },
      requireNormal: true,
    });
  };
}

/** I: restore a missing first word (I jumps past the indent). */
export function insertStart(): TaskGen {
  return (rng, base) => {
    const spans = need(
      allSpans(base).filter((s) => s.from === indentOf(base[s.line]) && base[s.line][s.to] === " "),
      "line head",
    );
    const s = pick(rng, spans);
    const perturbed = replaceRange(base, s.line, s.from, s.to + 1, "");
    return restore(base, perturbed, {
      instruction: "The line lost its first word — restore it from the line start, then `Esc`",
      keyHint: "I",
      ghost: { line: s.line, col: s.from, text: s.word + " " },
      requireNormal: true,
    });
  };
}

/** o / O: restore a whole missing line. */
export function openLine(dir: "o" | "O"): TaskGen {
  return (rng, base) => {
    const anchorOk = (line: string | undefined) =>
      line !== undefined && (isBlank(line) || indentOf(line) === 0);
    const candidates = nonBlankLines(base).filter((li) => {
      if (indentOf(base[li]) !== 0) return false;
      return dir === "o" ? li > 0 && anchorOk(base[li - 1]) : anchorOk(base[li + 1]);
    });
    const li = pick(rng, need(candidates, `${dir} line`));
    const removed = base[li];
    const perturbed = base.filter((_, i) => i !== li);
    const anchor = dir === "o" ? li - 1 : li; // index in the perturbed text
    const ghost =
      dir === "o"
        ? { line: anchor, col: perturbed[anchor].length, text: " ⏎ " + removed }
        : { line: anchor, col: 0, text: removed + " ⏎ " };
    // A blank anchor line cannot carry a visible focus mark; the ghost alone locates it.
    const marks: TaskMark[] =
      perturbed[anchor].length > 0
        ? [{ line: anchor, from: 0, to: perturbed[anchor].length, kind: "focus" }]
        : [];
    return restore(base, perturbed, {
      instruction:
        dir === "o"
          ? "A line is missing — open a new line below the ghost's line and type it, then `Esc`"
          : "A line is missing — open a new line above the ghost's line and type it, then `Esc`",
      keyHint: dir,
      marks,
      ghost,
      requireNormal: true,
    });
  };
}

// ---------------------------------------------------------------------------
// Text objects
// ---------------------------------------------------------------------------

type Region = { line: number; from: number; to: number }; // content range, delimiters excluded

function quoteRegions(base: Snippet, tight = false): Region[] {
  const regions: Region[] = [];
  for (const li of nonBlankLines(base)) {
    for (const m of base[li].matchAll(/"([^"]{2,24})"/g)) {
      if (tight) {
        const before = base[li][m.index - 1];
        const after = base[li][m.index + m[0].length];
        if (before === " " || before === undefined || after === " " || after === undefined) continue;
      }
      regions.push({ line: li, from: m.index + 1, to: m.index + 1 + m[1].length });
    }
  }
  return regions;
}

function bracketRegions(base: Snippet, open: "(" | "{" | "["): Region[] {
  const close = { "(": ")", "{": "}", "[": "]" }[open];
  const regions: Region[] = [];
  for (const li of nonBlankLines(base)) {
    const line = base[li];
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== open) continue;
      let depth = 1;
      for (let j = i + 1; j < line.length; j++) {
        if (line[j] === open) depth++;
        else if (line[j] === close) {
          depth--;
          if (depth === 0) {
            if (j - i - 1 >= 1 && j - i - 1 <= 34) regions.push({ line: li, from: i + 1, to: j });
            break;
          }
        }
      }
    }
  }
  return regions;
}

const PAIR_LABEL = { '"': "quotes", "(": "parentheses", "{": "braces", "[": "brackets" } as const;

/** di" / di( / di{ / di[: empty out a delimited span. */
export function deleteInsidePair(pair: '"' | "(" | "{" | "["): TaskGen {
  return (rng, base) => {
    const regions = pair === '"' ? quoteRegions(base) : bracketRegions(base, pair);
    const r = pick(rng, need(regions, `${pair} region`));
    const target = replaceRange(base, r.line, r.from, r.to, "");
    return modify(base, target, {
      instruction: `Delete the highlighted contents of the ${PAIR_LABEL[pair]} (cursor can be anywhere inside)`,
      keyHint: `di${pair}`,
      marks: [{ line: r.line, from: r.from, to: r.to }],
      startCursor: { line: r.line, col: r.from },
    });
  };
}

/** ci" / ci( / ci{: retype the contents of a delimited span. */
export function changeInsidePair(pair: '"' | "(" | "{"): TaskGen {
  return (rng, base) => {
    const regions = pair === '"' ? quoteRegions(base) : bracketRegions(base, pair);
    const r = pick(rng, need(regions, `${pair} region`));
    const word = pick(rng, WORDS);
    const target = replaceRange(base, r.line, r.from, r.to, word);
    return modify(base, target, {
      instruction: `Change the highlighted contents of the ${PAIR_LABEL[pair]} to \`${word}\`, then \`Esc\``,
      keyHint: `ci${pair}`,
      marks: [{ line: r.line, from: r.from, to: r.to }],
      startCursor: { line: r.line, col: r.from },
      requireNormal: true,
    });
  };
}

/** da" / da( / da[: delete a span including its delimiters. */
export function deleteAroundPair(pair: '"' | "(" | "["): TaskGen {
  return (rng, base) => {
    // For quotes, only spans with no adjacent space: vim's a" would otherwise
    // swallow neighboring whitespace and the expected result gets murky.
    const regions = pair === '"' ? quoteRegions(base, true) : bracketRegions(base, pair);
    const r = pick(rng, need(regions, `${pair} region`));
    const target = replaceRange(base, r.line, r.from - 1, r.to + 1, "");
    return modify(base, target, {
      instruction: `Delete the highlighted text including the ${PAIR_LABEL[pair]}`,
      keyHint: `da${pair}`,
      marks: [{ line: r.line, from: r.from - 1, to: r.to + 1 }],
      startCursor: { line: r.line, col: r.from },
    });
  };
}

/** dip: delete the lines of a paragraph, keeping the blank separators. */
export function deleteInsidePara(): TaskGen {
  return (rng, base) => {
    const blocks: { from: number; to: number }[] = [];
    let start: number | null = null;
    for (let i = 0; i <= base.length; i++) {
      if (i < base.length && !isBlank(base[i])) {
        if (start === null) start = i;
      } else if (start !== null) {
        blocks.push({ from: start, to: i - 1 });
        start = null;
      }
    }
    const b = pick(rng, need(blocks, "paragraph block"));
    const target = [...base.slice(0, b.from), ...base.slice(b.to + 1)];
    return modify(base, target, {
      instruction: "Delete every line of the highlighted paragraph with one command",
      keyHint: "dip",
      marks: Array.from({ length: b.to - b.from + 1 }, (_, k) => ({
        line: b.from + k,
        from: 0,
        to: base[b.from + k].length,
      })),
      startCursor: { line: b.from, col: 0 },
    });
  };
}

/** dap: delete a stray paragraph including its trailing blank line. */
export function deleteAroundPara(): TaskGen {
  return (rng, base) => {
    const blanks = need(base.map((_, i) => i).filter((i) => isBlank(base[i])), "blank line");
    const b = pick(rng, blanks);
    const junk = [`// scratch: ${pick(rng, WORDS)}`, `// scratch: ${pick(rng, WORDS)}`];
    const perturbed = [...base.slice(0, b + 1), ...junk, "", ...base.slice(b + 1)];
    return restore(base, perturbed, {
      instruction: "Delete the highlighted stray paragraph — `dap` takes its blank line too",
      keyHint: "dap",
      marks: junk.map((l, k) => ({ line: b + 1 + k, from: 0, to: l.length })),
      startCursor: { line: b + 1, col: 0 },
    });
  };
}

// ---------------------------------------------------------------------------
// Visual mode
// ---------------------------------------------------------------------------

/** v + motions + d: delete a highlighted span inside a line. */
export function visualDeleteSpan(): TaskGen {
  return (rng, base) => {
    const candidates: { li: number; s: number }[] = [];
    for (const li of nonBlankLines(base)) {
      const line = base[li];
      for (let s = indentOf(line) + 2; s < line.length - 2; s++) {
        if (line[s] === " " && line[s - 1] !== " ") candidates.push({ li, s });
      }
    }
    const c = pick(rng, need(candidates, "span point"));
    const [j1, j2] = sample(rng, WORDS, 2);
    const junk = ` ${j1} ${j2}`;
    const perturbed = replaceRange(base, c.li, c.s, c.s, junk);
    return restore(base, perturbed, {
      instruction: "Select the highlighted span with `v` and motions, then delete it",
      keyHint: "v … d",
      marks: [{ line: c.li, from: c.s, to: c.s + junk.length }],
    });
  };
}

/** V + j + d: delete a highlighted run of whole lines. */
export function visualDeleteLines(): TaskGen {
  return (rng, base) => {
    const p = int(rng, 1, base.length - 1);
    const count = int(rng, 2, 3);
    const junk = Array.from({ length: count }, () => `// scratch: ${pick(rng, WORDS)}`);
    const perturbed = [...base.slice(0, p), ...junk, ...base.slice(p)];
    return restore(base, perturbed, {
      instruction: "Select the highlighted lines with `V` and `j`, then delete them",
      keyHint: "V j d",
      marks: junk.map((l, k) => ({ line: p + k, from: 0, to: l.length })),
    });
  };
}

// ---------------------------------------------------------------------------
// Power tools: marks, macros
// ---------------------------------------------------------------------------

/** ma … 'a: fix a far-away typo, then jump back to the marked spot. */
export function markRoundTrip(): TaskGen {
  return (rng, base) => {
    const homes = need(
      nonBlankLines(base).filter((l) => l <= 2 && indentOf(base[l]) === 0),
      "home line",
    );
    const home = pick(rng, homes);
    const spans = need(allSpans(base).filter((s) => s.line >= home + 4), "far typo");
    const s = pick(rng, spans);
    const k = int(rng, 1, s.word.length - 1);
    const perturbed = replaceRange(base, s.line, s.from + k, s.from + k, s.word[k - 1]);
    return restore(base, perturbed, {
      instruction: "Press `ma` to mark this spot, delete the highlighted duplicate letter, then jump back with `'a`",
      keyHint: "ma … 'a",
      startCursor: { line: home, col: 0 },
      targetCursor: { line: home, col: 0 },
      marks: [{ line: s.line, from: s.from + k, to: s.from + k + 1 }],
    });
  };
}

/** qa … q @a: the same edit on every line (use with LIST_SNIPPETS). */
export function macroLines(kind: "append" | "prefix"): TaskGen {
  return (rng, base) => {
    let target: string[];
    let instruction: string;
    if (kind === "append") {
      const suffix = pick(rng, [";", ",", "."]);
      target = base.map((l) => l + suffix);
      instruction = `Append \`${suffix}\` to every line: record once with \`qa\`, replay with \`@a\``;
    } else {
      const prefix = pick(rng, ["- ", "* ", "> "]);
      target = base.map((l) => prefix + l);
      instruction = `Prefix every line with \`${prefix.trim()}\` and a space: record with \`qa\`, replay with \`@a\``;
    }
    return modify(base, target, {
      instruction,
      keyHint: "qa … q @a",
      requireNormal: true,
    });
  };
}
