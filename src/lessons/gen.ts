import type { Rng, Task, TaskGen } from "./types";

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
// Content pools
// ---------------------------------------------------------------------------

const WORDS = [
  "editor", "cursor", "window", "buffer", "margin", "syntax", "render",
  "stream", "packet", "kernel", "branch", "commit", "string", "vector",
  "module", "object", "filter", "socket", "thread", "parser", "tokens",
  "output", "signal", "quartz", "meadow", "copper", "violet", "harbor",
  "lantern", "orchid", "pebble", "timber", "willow", "canyon", "ember",
  "fjord", "glacier", "summit", "prairie", "cinder", "raven", "marble",
  "cobalt", "juniper", "sable", "tundra", "velvet", "wander", "yonder",
  "zephyr", "amber", "basalt", "cedar", "dune", "eddy", "flint",
  "grove", "heron", "inlet", "jetty", "knoll", "lagoon", "mesa", "nectar",
];

const TOKENS = [
  "foo.bar(baz)", "list[idx]", "obj.get(key)", "a+b*c", "map(fn,xs)",
  "x->next", "cfg{opt:1}", "arr[0].len", "f(x,y)", "s.split(',')",
];

const CODE_LINES = [
  'const total = price * count + tax;',
  'function parse(input) { return input.trim(); }',
  'let result = items.filter(x => x.active);',
  'if (count > limit) { throw new Error("too many"); }',
  'const name = user.profile.name || "anonymous";',
  'export default { mode: "dark", size: 14 };',
  'while (queue.length > 0) queue.pop().run();',
  'return rows.map(r => r.value).join(", ");',
];

const JUNK = ["@@#!garbage", "%%scratch%%", "<<<todo>>>", "~~leftover~~"];

// ---------------------------------------------------------------------------
// Text builders
// ---------------------------------------------------------------------------

type Line = { text: string; words: string[]; cols: number[] };

function makeLine(words: string[]): Line {
  const cols: number[] = [];
  let c = 0;
  for (const w of words) {
    cols.push(c);
    c += w.length + 1;
  }
  return { text: words.join(" "), words, cols };
}

function proseLine(rng: Rng, count: number): Line {
  return makeLine(sample(rng, WORDS, count));
}

function proseBlock(rng: Rng, lineCount: number, perLine: number): Line[] {
  const words = sample(rng, WORDS, lineCount * perLine);
  const lines: Line[] = [];
  for (let i = 0; i < lineCount; i++) {
    lines.push(makeLine(words.slice(i * perLine, (i + 1) * perLine)));
  }
  return lines;
}

function joinBlock(lines: Line[]): string {
  return lines.map((l) => l.text).join("\n");
}

// ---------------------------------------------------------------------------
// Movement generators (green target cell)
// ---------------------------------------------------------------------------

/** hjkl practice: move to a highlighted cell in a block of text. */
export function gridMove(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 6, 8), int(rng, 4, 5));
    const startLine = int(rng, 0, lines.length - 1);
    let targetLine = int(rng, 0, lines.length - 1);
    if (Math.abs(targetLine - startLine) < 2) {
      targetLine = (targetLine + 3) % lines.length;
    }
    const text = joinBlock(lines);
    return {
      instruction: "Move the cursor to the highlighted cell",
      keyHint: "hjkl",
      startText: text,
      startCursor: { line: startLine, col: int(rng, 0, lines[startLine].text.length - 1) },
      targetText: text,
      targetCursor: { line: targetLine, col: int(rng, 0, lines[targetLine].text.length - 1) },
    };
  };
}

/** w / b: jump to the start of a named word. */
export function moveWordStart(): TaskGen {
  return (rng) => {
    const { text, words, cols } = proseLine(rng, int(rng, 6, 8));
    const from = int(rng, 0, words.length - 1);
    let to = int(rng, 0, words.length - 1);
    if (to === from) to = (to + 3) % words.length;
    return {
      instruction: `Move to the start of \`${words[to]}\``,
      keyHint: to < from ? "b" : "w",
      startText: text,
      startCursor: { line: 0, col: cols[from] },
      targetText: text,
      targetCursor: { line: 0, col: cols[to] },
    };
  };
}

/** e / ge: jump to the end of a named word. */
export function moveWordEnd(): TaskGen {
  return (rng) => {
    const { text, words, cols } = proseLine(rng, int(rng, 6, 8));
    const from = int(rng, 0, words.length - 1);
    let to = int(rng, 0, words.length - 1);
    if (to === from) to = (to + 3) % words.length;
    return {
      instruction: `Move to the last letter of \`${words[to]}\``,
      keyHint: to < from ? "ge" : "e",
      startText: text,
      startCursor: { line: 0, col: cols[from] },
      targetText: text,
      targetCursor: { line: 0, col: cols[to] + words[to].length - 1 },
    };
  };
}

/** W / B: jump across punctuation-heavy WORDs. */
export function moveBigWord(): TaskGen {
  return (rng) => {
    const line = makeLine(sample(rng, TOKENS, int(rng, 4, 5)));
    const from = int(rng, 0, line.words.length - 1);
    let to = int(rng, 0, line.words.length - 1);
    if (to === from) to = (to + 2) % line.words.length;
    return {
      instruction: `Move to the start of \`${line.words[to]}\``,
      keyHint: to < from ? "B" : "W",
      startText: line.text,
      startCursor: { line: 0, col: line.cols[from] },
      targetText: line.text,
      targetCursor: { line: 0, col: line.cols[to] },
    };
  };
}

/** 0 / ^ / $: jump to an edge of the line. */
export function moveLineEdge(kind: "0" | "^" | "$"): TaskGen {
  return (rng) => {
    const indent = kind === "^" ? int(rng, 2, 6) : 0;
    const { text, words, cols } = proseLine(rng, int(rng, 5, 7));
    const line = " ".repeat(indent) + text;
    let startCol: number;
    let targetCol: number;
    let instruction: string;
    if (kind === "$") {
      targetCol = line.length - 1;
      startCol = indent + cols[int(rng, 0, 2)];
      instruction = "Jump to the end of the line";
    } else if (kind === "0") {
      targetCol = 0;
      startCol = indent + cols[int(rng, 2, words.length - 1)];
      instruction = "Jump to the very start of the line";
    } else {
      targetCol = indent;
      startCol = indent + cols[int(rng, 2, words.length - 1)];
      instruction = "Jump to the first character after the indent";
    }
    return {
      instruction,
      keyHint: kind,
      startText: line,
      startCursor: { line: 0, col: startCol },
      targetText: line,
      targetCursor: { line: 0, col: targetCol },
    };
  };
}

/** gg / G / nG: jump to a line by position or number. */
export function gotoLine(): TaskGen {
  return (rng) => {
    const n = int(rng, 8, 11);
    const text = joinBlock(proseBlock(rng, n, 3));
    const kind = pick(rng, ["gg", "G", "nG"] as const);
    let target: number;
    let startLine: number;
    let instruction: string;
    let keyHint: string;
    if (kind === "gg") {
      target = 0;
      startLine = int(rng, 4, n - 1);
      instruction = "Jump to the first line";
      keyHint = "gg";
    } else if (kind === "G") {
      target = n - 1;
      startLine = int(rng, 0, n - 5);
      instruction = "Jump to the last line";
      keyHint = "G";
    } else {
      target = int(rng, 2, n - 3);
      startLine = target > n / 2 ? 0 : n - 1;
      instruction = `Jump to line ${target + 1}`;
      keyHint = `${target + 1}G`;
    }
    return {
      instruction,
      keyHint,
      startText: text,
      startCursor: { line: startLine, col: 0 },
      targetText: text,
      targetCursor: { line: target, col: 0 },
    };
  };
}

/** f / t / F on a code line, with ; for second occurrences. */
export function findChar(kind: "f" | "t" | "F"): TaskGen {
  const PUNCT = new Set("=(){}[];.,*+<>|&\"'".split(""));
  return (rng) => {
    const line = pick(rng, CODE_LINES);
    const occurrences = new Map<string, number[]>();
    for (let i = 1; i < line.length - 1; i++) {
      const ch = line[i];
      if (!PUNCT.has(ch)) continue;
      if (!occurrences.has(ch)) occurrences.set(ch, []);
      occurrences.get(ch)!.push(i);
    }
    const chars = [...occurrences.keys()];
    const ch = pick(rng, chars);
    const idxs = occurrences.get(ch)!;
    if (kind === "F") {
      const target = idxs[idxs.length - 1];
      return {
        instruction: `Jump back to the last \`${ch}\` in the line`,
        keyHint: `F${ch}`,
        startText: line,
        startCursor: { line: 0, col: line.length - 1 },
        targetText: line,
        targetCursor: { line: 0, col: target },
      };
    }
    const nth = idxs.length > 1 && rng() < 0.4 ? 1 : 0;
    const target = kind === "t" ? idxs[nth] - 1 : idxs[nth];
    const which = nth === 0 ? "first" : "second";
    const how = kind === "t" ? "just before the" : "the";
    return {
      instruction: `Jump to ${how} ${which} \`${ch}\` in the line`,
      keyHint: nth === 0 ? `${kind}${ch}` : `${kind}${ch} ;`,
      startText: line,
      startCursor: { line: 0, col: 0 },
      targetText: line,
      targetCursor: { line: 0, col: target },
    };
  };
}

/** { / }: jump between paragraphs to a highlighted blank line. */
export function paraJump(): TaskGen {
  return (rng) => {
    const paras: string[] = [];
    const block = proseBlock(rng, 6, 4);
    for (let p = 0; p < 3; p++) {
      paras.push(block[p * 2].text + "\n" + block[p * 2 + 1].text);
    }
    const text = paras.join("\n\n");
    // Line layout: para lines 0-1, blank 2, para lines 3-4, blank 5, para lines 6-7.
    const options = [
      { start: 0, blank: 2, label: "forward one paragraph", hint: "}" },
      { start: 0, blank: 5, label: "forward two paragraphs", hint: "}}" },
      { start: 3, blank: 5, label: "forward one paragraph", hint: "}" },
      { start: 4, blank: 2, label: "back one paragraph", hint: "{" },
      { start: 7, blank: 5, label: "back one paragraph", hint: "{" },
      { start: 7, blank: 2, label: "back two paragraphs", hint: "{{" },
    ];
    const o = pick(rng, options);
    return {
      instruction: `Jump ${o.label} to the highlighted blank line`,
      keyHint: o.hint,
      startText: text,
      startCursor: { line: o.start, col: 0 },
      targetText: text,
      targetCursor: { line: o.blank, col: 0 },
    };
  };
}

/** * / #: jump to another occurrence of the word under the cursor. */
export function searchWord(dir: "*" | "#"): TaskGen {
  return (rng) => {
    const perLine = 4;
    const lines = proseBlock(rng, 7, perLine);
    const star = sample(rng, WORDS, 7 * perLine + 1)[7 * perLine];
    const occLines = [0, 3, 6].map((l) => l + int(rng, 0, 0));
    const occ: { line: number; col: number }[] = [];
    for (const l of occLines) {
      const wi = int(rng, 0, perLine - 1);
      const words = [...lines[l].words];
      words[wi] = star;
      lines[l] = makeLine(words);
      occ.push({ line: l, col: lines[l].cols[wi] });
    }
    const text = joinBlock(lines);
    const [a, b, c] = occ;
    const start = dir === "*" ? a : c;
    const target = b;
    return {
      instruction:
        dir === "*"
          ? `Jump to the next occurrence of \`${star}\``
          : `Jump to the previous occurrence of \`${star}\``,
      keyHint: dir,
      startText: text,
      startCursor: start,
      targetText: text,
      targetCursor: target,
    };
  };
}

// ---------------------------------------------------------------------------
// Editing generators (red highlight marks what to remove or change)
// ---------------------------------------------------------------------------

/** x: delete a doubled letter. */
export function deleteChar(): TaskGen {
  return (rng) => {
    const { words } = proseLine(rng, int(rng, 5, 7));
    const wi = int(rng, 1, words.length - 1);
    const w = words[wi];
    const k = int(rng, 1, w.length - 1);
    const broken = [...words];
    broken[wi] = w.slice(0, k) + w[k - 1] + w.slice(k);
    const start = makeLine(broken);
    return {
      instruction: "Delete the highlighted duplicate letter",
      keyHint: "x",
      startText: start.text,
      startCursor: { line: 0, col: 0 },
      targetText: words.join(" "),
      marks: [{ line: 0, from: start.cols[wi] + k, to: start.cols[wi] + k + 1 }],
    };
  };
}

/** dw / daw: delete a duplicated word. */
export function deleteWord(op: "dw" | "daw"): TaskGen {
  return (rng) => {
    const { words } = proseLine(rng, int(rng, 5, 7));
    const wi = int(rng, 0, words.length - 2);
    const broken = [...words.slice(0, wi + 1), words[wi], ...words.slice(wi + 1)];
    const start = makeLine(broken);
    const dupCol = start.cols[wi + 1];
    return {
      instruction: "Delete the highlighted repeated word",
      keyHint: op,
      startText: start.text,
      startCursor: { line: 0, col: 0 },
      targetText: words.join(" "),
      marks: [{ line: 0, from: dupCol, to: dupCol + words[wi].length + 1 }],
    };
  };
}

/** d2w: delete two junk words in a row. */
export function deleteTwoWords(): TaskGen {
  return (rng) => {
    const all = sample(rng, WORDS, 8);
    const words = all.slice(0, 6);
    const junk = all.slice(6);
    const wi = int(rng, 1, words.length - 2);
    const broken = [...words.slice(0, wi), ...junk, ...words.slice(wi)];
    const start = makeLine(broken);
    const from = start.cols[wi];
    return {
      instruction: "Delete the two highlighted words",
      keyHint: "d2w",
      startText: start.text,
      startCursor: { line: 0, col: 0 },
      targetText: words.join(" "),
      marks: [{ line: 0, from, to: from + junk[0].length + junk[1].length + 2 }],
    };
  };
}

/** dd: delete a duplicated line. */
export function deleteLine(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 5, 7), 3);
    const li = int(rng, 0, lines.length - 1);
    const texts = lines.map((l) => l.text);
    const broken = [...texts.slice(0, li + 1), texts[li], ...texts.slice(li + 1)];
    return {
      instruction: "Delete the highlighted duplicate line",
      keyHint: "dd",
      startText: broken.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: texts.join("\n"),
      marks: [{ line: li + 1, from: 0, to: texts[li].length }],
    };
  };
}

/** D / d$: delete junk from the cursor to the end of the line. */
export function deleteToEnd(): TaskGen {
  return (rng) => {
    const line = pick(rng, CODE_LINES);
    const junk = pick(rng, JUNK);
    const start = line + junk;
    return {
      instruction: "Delete the highlighted junk at the end of the line",
      keyHint: "D",
      startText: start,
      startCursor: { line: 0, col: 0 },
      targetText: line,
      marks: [{ line: 0, from: line.length, to: start.length }],
    };
  };
}

/** yyp: duplicate a line. */
export function duplicateLine(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 4, 6), 3).map((l) => l.text);
    const li = int(rng, 0, lines.length - 1);
    const target = [...lines.slice(0, li + 1), lines[li], ...lines.slice(li + 1)];
    return {
      instruction: `Duplicate line ${li + 1}`,
      keyHint: "yyp",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
    };
  };
}

/** ddp: swap a line with the one below it. */
export function swapLines(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 4, 6), 3).map((l) => l.text);
    const li = int(rng, 0, lines.length - 2);
    const target = [...lines];
    [target[li], target[li + 1]] = [target[li + 1], target[li]];
    return {
      instruction: `Swap lines ${li + 1} and ${li + 2}`,
      keyHint: "ddp",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
    };
  };
}

/** cw / ciw: change a word to a given replacement. */
export function changeWord(): TaskGen {
  return (rng) => {
    const all = sample(rng, WORDS, 8);
    const words = all.slice(0, 7);
    const replacement = all[7];
    const wi = int(rng, 1, words.length - 1);
    const start = makeLine(words);
    const target = [...words];
    target[wi] = replacement;
    return {
      instruction: `Change the highlighted word to \`${replacement}\``,
      keyHint: "cw",
      startText: start.text,
      startCursor: { line: 0, col: 0 },
      targetText: target.join(" "),
      marks: [{ line: 0, from: start.cols[wi], to: start.cols[wi] + words[wi].length }],
      requireNormal: true,
    };
  };
}

/** r: fix a single wrong letter. */
export function replaceChar(): TaskGen {
  return (rng) => {
    const { words } = proseLine(rng, int(rng, 5, 7));
    const wi = int(rng, 1, words.length - 1);
    const w = words[wi];
    const k = int(rng, 1, w.length - 1);
    const wrong = pick(rng, ["x", "z", "q", "k"].filter((c) => c !== w[k]));
    const broken = [...words];
    broken[wi] = w.slice(0, k) + wrong + w.slice(k + 1);
    const start = makeLine(broken);
    return {
      instruction: `Fix the highlighted letter, it should be \`${w[k]}\``,
      keyHint: `r${w[k]}`,
      startText: start.text,
      startCursor: { line: 0, col: 0 },
      targetText: words.join(" "),
      marks: [{ line: 0, from: start.cols[wi] + k, to: start.cols[wi] + k + 1 }],
    };
  };
}

/** ~: capitalize the highlighted letter. */
export function toggleCase(): TaskGen {
  return (rng) => {
    const { words, cols, text } = proseLine(rng, int(rng, 5, 7));
    const wi = int(rng, 1, words.length - 1);
    const target = [...words];
    target[wi] = words[wi][0].toUpperCase() + words[wi].slice(1);
    return {
      instruction: "Capitalize the highlighted letter",
      keyHint: "~",
      startText: text,
      startCursor: { line: 0, col: 0 },
      targetText: target.join(" "),
      marks: [{ line: 0, from: cols[wi], to: cols[wi] + 1 }],
    };
  };
}

/** J: join two lines of a split sentence. */
export function joinLines(): TaskGen {
  return (rng) => {
    const { words } = proseLine(rng, int(rng, 7, 9));
    const k = int(rng, 3, words.length - 3);
    const lineA = words.slice(0, k).join(" ");
    const lineB = words.slice(k).join(" ");
    return {
      instruction: "Join the two lines into one",
      keyHint: "J",
      startText: lineA + "\n" + lineB,
      startCursor: { line: 0, col: 0 },
      targetText: words.join(" "),
    };
  };
}

// ---------------------------------------------------------------------------
// Insert-mode generators
// ---------------------------------------------------------------------------

/** i on an empty buffer: just type something and get back out. */
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

/** i at the cursor: restore a missing word. */
export function insertMissing(): TaskGen {
  return (rng) => {
    const { words } = proseLine(rng, int(rng, 6, 8));
    const wi = int(rng, 1, words.length - 2);
    const withGap = makeLine([...words.slice(0, wi), ...words.slice(wi + 1)]);
    return {
      instruction: `A word is missing at the cursor. Press \`i\`, type \`${words[wi]}\` plus a space, then \`Esc\``,
      keyHint: "i",
      startText: withGap.text,
      startCursor: { line: 0, col: withGap.cols[wi] },
      targetText: words.join(" "),
      requireNormal: true,
    };
  };
}

/** A: append a word at the end of a line. */
export function appendEnd(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 3, 5), 3).map((l) => l.text);
    const extra = pick(rng, WORDS);
    const li = int(rng, 0, lines.length - 1);
    const target = [...lines];
    target[li] = lines[li] + " " + extra;
    return {
      instruction: `Append a space and \`${extra}\` to the end of line ${li + 1}, then \`Esc\``,
      keyHint: "A",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
      requireNormal: true,
    };
  };
}

/** I: prepend a word at the start of a line. */
export function insertStart(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 3, 5), 3).map((l) => l.text);
    const extra = pick(rng, WORDS);
    const li = int(rng, 0, lines.length - 1);
    const target = [...lines];
    target[li] = extra + " " + lines[li];
    return {
      instruction: `Insert \`${extra}\` plus a space at the start of line ${li + 1}, then \`Esc\``,
      keyHint: "I",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
      requireNormal: true,
    };
  };
}

/** o / O: open a new line and type into it. */
export function openLine(dir: "o" | "O"): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 3, 4), 3).map((l) => l.text);
    const content = sample(rng, WORDS, 2).join(" ");
    const li = int(rng, 0, lines.length - 1);
    const at = dir === "o" ? li + 1 : li;
    const target = [...lines.slice(0, at), content, ...lines.slice(at)];
    const where = dir === "o" ? "below" : "above";
    return {
      instruction: `Open a new line ${where} line ${li + 1}, type \`${content}\`, then \`Esc\``,
      keyHint: dir,
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
      requireNormal: true,
    };
  };
}

// ---------------------------------------------------------------------------
// Text objects
// ---------------------------------------------------------------------------

/** di" / di( / di[: empty out a delimited span. */
export function deleteInside(pair: '"' | "(" | "["): TaskGen {
  const close = { '"': '"', "(": ")", "[": "]" }[pair];
  const label = { '"': "quotes", "(": "parentheses", "[": "brackets" }[pair];
  return (rng) => {
    const [w1, w2, w3] = sample(rng, WORDS, 3);
    const prefix = `const ${w1} = ${pair}`;
    const inner = `${w2} ${w3}`;
    const start = `${prefix}${inner}${close};`;
    return {
      instruction: `Delete the highlighted contents of the ${label}`,
      keyHint: `di${pair}`,
      startText: start,
      startCursor: { line: 0, col: prefix.length + int(rng, 0, inner.length - 1) },
      targetText: `${prefix}${close};`,
      marks: [{ line: 0, from: prefix.length, to: prefix.length + inner.length }],
    };
  };
}

/** da(: delete a bracketed span including the brackets. */
export function deleteAround(): TaskGen {
  return (rng) => {
    const [w1, w2, w3] = sample(rng, WORDS, 3);
    const prefix = `${w1}`;
    const call = `(${w2}, ${w3})`;
    const start = `${prefix}${call};`;
    return {
      instruction: "Delete the highlighted call including the parentheses",
      keyHint: "da(",
      startText: start,
      startCursor: { line: 0, col: prefix.length + int(rng, 1, call.length - 2) },
      targetText: `${prefix};`,
      marks: [{ line: 0, from: prefix.length, to: prefix.length + call.length }],
    };
  };
}

/** ci": retype the contents of a string. */
export function changeInside(): TaskGen {
  return (rng) => {
    const [w1, w2, w3] = sample(rng, WORDS, 3);
    const prefix = `const ${w1} = "`;
    const start = `${prefix}${w2}";`;
    return {
      instruction: `Change the highlighted string to \`${w3}\`, then \`Esc\``,
      keyHint: 'ci"',
      startText: start,
      startCursor: { line: 0, col: prefix.length + int(rng, 0, w2.length - 1) },
      targetText: `${prefix}${w3}";`,
      marks: [{ line: 0, from: prefix.length, to: prefix.length + w2.length }],
      requireNormal: true,
    };
  };
}

// ---------------------------------------------------------------------------
// Visual mode
// ---------------------------------------------------------------------------

/** V + j + d: delete a highlighted run of whole lines. */
export function visualDeleteLines(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 6, 8), 3).map((l) => l.text);
    const count = int(rng, 2, 3);
    const li = int(rng, 0, lines.length - 1 - count);
    const target = [...lines.slice(0, li), ...lines.slice(li + count)];
    return {
      instruction: "Delete the highlighted lines",
      keyHint: "Vjd",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
      marks: Array.from({ length: count }, (_, k) => ({
        line: li + k,
        from: 0,
        to: lines[li + k].length,
      })),
    };
  };
}

/** v + motions + d: delete a highlighted span inside a line. */
export function visualDeleteSpan(): TaskGen {
  return (rng) => {
    const { words, cols, text } = proseLine(rng, int(rng, 7, 9));
    const i = int(rng, 1, words.length - 4);
    const j = i + int(rng, 1, 2);
    const from = cols[i];
    const to = cols[j] + words[j].length + 1; // include the trailing space
    const target = [...words.slice(0, i), ...words.slice(j + 1)].join(" ");
    return {
      instruction: "Select the highlighted text with `v` and delete it",
      keyHint: "v…d",
      startText: text,
      startCursor: { line: 0, col: 0 },
      targetText: target,
      marks: [{ line: 0, from, to }],
    };
  };
}

// ---------------------------------------------------------------------------
// Power features: dot, registers, marks, macros
// ---------------------------------------------------------------------------

/** dw then j then .: the same junk word on several lines. */
export function dotRepeat(): TaskGen {
  return (rng) => {
    const perLine = 4;
    const lineCount = 4;
    const all = sample(rng, WORDS, lineCount * perLine + 1);
    const junk = all[lineCount * perLine];
    const lines: Line[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(makeLine(all.slice(i * perLine, (i + 1) * perLine)));
    }
    const targetText = joinBlock(lines);
    const marks = [];
    for (const l of [0, 1, 2]) {
      const wi = int(rng, 0, perLine - 1);
      const words = [...lines[l].words];
      words.splice(wi, 0, junk);
      lines[l] = makeLine(words);
      marks.push({ line: l, from: lines[l].cols[wi], to: lines[l].cols[wi] + junk.length + 1 });
    }
    return {
      instruction: "Delete every highlighted word. Delete the first with `dw`, then repeat with `.`",
      keyHint: "dw j .",
      startText: joinBlock(lines),
      startCursor: { line: 0, col: 0 },
      targetText,
      marks,
    };
  };
}

/** Registers: copy a line and paste it somewhere else. */
export function copyLineBelow(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 5, 7), 3).map((l) => l.text);
    const src = int(rng, 0, lines.length - 1);
    let dst = int(rng, 0, lines.length - 1);
    if (dst === src) dst = (dst + 2) % lines.length;
    const target = [...lines.slice(0, dst + 1), lines[src], ...lines.slice(dst + 1)];
    return {
      instruction: `Copy line ${src + 1} and paste it below line ${dst + 1}`,
      keyHint: "yy p",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
    };
  };
}

/** Registers: move a line below another line. */
export function moveLineBelow(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 5, 7), 3).map((l) => l.text);
    const src = int(rng, 0, lines.length - 1);
    let dst = int(rng, 0, lines.length - 1);
    if (Math.abs(dst - src) < 2) dst = (dst + 3) % lines.length;
    const without = lines.filter((_, i) => i !== src);
    const at = without.indexOf(lines[dst]);
    const target = [...without.slice(0, at + 1), lines[src], ...without.slice(at + 1)];
    return {
      instruction: `Move line ${src + 1} so it sits below line ${dst + 1}`,
      keyHint: "dd p",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
    };
  };
}

/** Marks: fix a far-away typo, then jump back to the marked spot. */
export function markRoundTrip(): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, 11, 3);
    const home = int(rng, 0, 2);
    const typoLine = int(rng, 7, 10);
    const texts = lines.map((l) => l.text);
    const targetText = texts.join("\n");
    const { words, cols } = lines[typoLine];
    const wi = int(rng, 0, words.length - 1);
    const w = words[wi];
    const k = int(rng, 1, w.length - 1);
    const brokenWords = [...words];
    brokenWords[wi] = w.slice(0, k) + w[k - 1] + w.slice(k);
    texts[typoLine] = brokenWords.join(" ");
    return {
      instruction: `Press \`ma\` to mark this spot, delete the highlighted duplicate letter on line ${typoLine + 1}, then jump back with \`'a\``,
      keyHint: "ma … 'a",
      startText: texts.join("\n"),
      startCursor: { line: home, col: 0 },
      targetText,
      targetCursor: { line: home, col: 0 },
      marks: [{ line: typoLine, from: cols[wi] + k, to: cols[wi] + k + 1 }],
    };
  };
}

/** Macros: the same edit on every line. */
export function macroLines(kind: "append" | "prefix"): TaskGen {
  return (rng) => {
    const lines = proseBlock(rng, int(rng, 4, 5), 3).map((l) => l.text);
    let target: string[];
    let instruction: string;
    if (kind === "append") {
      const suffix = pick(rng, [";", ",", "."]);
      target = lines.map((l) => l + suffix);
      instruction = `Append \`${suffix}\` to the end of every line. Record it once with \`qa\`, replay with \`@a\``;
    } else {
      const prefix = pick(rng, ["- ", "* ", "> "]);
      target = lines.map((l) => prefix + l);
      instruction = `Prefix every line with \`${prefix.trim()}\` and a space. Record it once with \`qa\`, replay with \`@a\``;
    }
    return {
      instruction,
      keyHint: "qa … q @a",
      startText: lines.join("\n"),
      startCursor: { line: 0, col: 0 },
      targetText: target.join("\n"),
      requireNormal: true,
    };
  };
}
