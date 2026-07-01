# learn-vim — Design Spec

**Date:** 2026-07-01
**Status:** Approved by user (sections 1–4 presented conversationally)

## Purpose

A local, free, vim-hero-style web app for learning Vim interactively. The user
works through a progressive curriculum of lessons; each lesson mixes short
explanations with hands-on challenges solved inside a Vim-emulating editor.
Motivation: vim-hero.com paywalls ~2/3 of its content.

Success criteria: the user can go from zero to comfortable with advanced Vim
(registers, macros, marks, dot command) using only this app, running locally
with `npm run dev`.

## Stack

- Vite + vanilla TypeScript. No UI framework, no backend.
- `codemirror` (v6) + `@replit/codemirror-vim` for the editor and Vim emulation.
- `localStorage` for progress.
- Vitest for tests.
- Tiny hash-based router (`#/lesson/<id>`), no routing library.

## Architecture

Five modules with strict boundaries:

| Module | Responsibility | Depends on |
|---|---|---|
| `engine/` | Wraps CodeMirror + vim mode. Create editor with given text/cursor; read text/cursor/mode; subscribe to keystrokes and state changes. Only module that imports CodeMirror. | codemirror, @replit/codemirror-vim |
| `lessons/` | Pure data: curriculum as one TS file per lesson. No logic. | (types only) |
| `challenge/` | The referee: given a challenge definition + engine instance, detects completion (state match) and counts keystrokes vs. par. | engine (interface) |
| `progress/` | Versioned localStorage wrapper: per-challenge done flag and best keystroke count. | — |
| `ui/` | Renders home screen and lesson view; owns the router. | all of the above |

## Data model

```ts
type Lesson = {
  id: string;            // e.g. "03-word-motions"
  title: string;
  section: string;       // curriculum section name
  order: number;
  steps: Step[];
};

type Step = Explanation | Challenge;

type Explanation = {
  kind: "explanation";
  text: string;                 // supports inline code formatting
  example?: { text: string };   // optional read-only editor snippet
};

type Challenge = {
  kind: "challenge";
  id: string;            // unique across all lessons
  instruction: string;   // e.g. "Delete the word under the cursor"
  startText: string;
  startCursor: { line: number; col: number };
  targetText: string;
  targetCursor?: { line: number; col: number }; // set for pure-motion challenges
  par: number;           // optimal keystroke count
  hint?: string;         // revealed on request
};
```

Cursor positions are 0-indexed (line 0 = first line, col 0 = first column).

Completion rule: challenge is solved when editor text equals `targetText`
AND, if `targetCursor` is set, the cursor is at that position. Keystrokes are
counted from challenge start; solving at or under `par` is highlighted, over
par still passes.

Keystroke counting: one key event consumed by the editor = one keystroke.
A modifier chord like `<C-r>` counts as one; `daw` counts as three. Pure
modifier presses (Shift/Ctrl alone) don't count.

## UI

Two screens:

1. **Home** (`#/`): curriculum grid — sections with lesson cards, each showing
   completion state (not started / partial / done) from progress data.
2. **Lesson view** (`#/lesson/<id>`): instruction text on top, editor in the
   middle, status bar below showing current vim mode, keystrokes typed
   (formatted, e.g. `d a w`, `<Esc>`, `<C-r>`), keystroke count vs. par, and a
   ✓ on completion. Controls: Reset (restore challenge start state), Skip,
   Next step, Back to home. Editor auto-focuses.

## Curriculum (~18 lessons, 6 sections)

1. **Fundamentals**
   1. Intro to modes (normal/insert, `i`, `<Esc>`)
   2. Basic movement (`h j k l`)
   3. Insert commands (`i a I A o O`)
2. **Motions**
   4. Word motions (`w b e ge`, `W B E`)
   5. Line navigation (`0 ^ $ gg G`, `{n}G`)
   6. Find on line (`f t F T ; ,`)
   7. Vertical movement (`{ }`, `Ctrl-d Ctrl-u`)
3. **Editing**
   8. Deleting (`x dd dw D`, counts)
   9. Change, yank, put (`cw cc C yy yw p P`)
   10. Operator grammar + dot command (operator+count+motion, `.`)
   11. Replace & misc (`r R ~ J u Ctrl-r`)
4. **Search**
   12. Search (`/ ? n N * #`)
5. **Text objects & visual mode**
   13. Text objects (`iw aw i" a" i( a( ip ap it`)
   14. Visual mode (`v V Ctrl-v`, `o`, operators on selections)
6. **Power features**
   15. Registers (named registers, `"ay "ap`, `"0`, `"_`)
   16. Marks (`ma`, backtick-a, `'a`)
   17. Macros (`q @ @@`)
   18. Capstone: combined workflows (multi-step editing tasks using everything)

Each lesson: 1–3 explanation steps interleaved with 3–8 challenges,
progressing from single-key drills to small realistic edits. Later lessons
reuse earlier skills.

## Progress

`localStorage` key `learn-vim-progress-v1`:

```ts
type ProgressData = {
  version: 1;
  challenges: Record<string, { done: boolean; bestKeystrokes: number }>;
};
```

Corrupt/missing data → start fresh. Version bump → migrate or reset.

## Error handling

- Reset button restores `startText`/`startCursor` and zeroes the keystroke
  counter at any time (handles stuck states, accidental macros, etc.).
- Skip always available; skipped challenges are not marked done.
- Vim mode is displayed prominently; editor refocuses on click/reset so
  keystrokes never go to a dead page.
- Unknown lesson id in URL → redirect home.

## Testing

- **Referee unit tests**: completion detection (text-only and text+cursor
  targets), keystroke counting, par comparison, reset behavior.
- **Keystroke formatter tests**: printable keys, `<Esc>`, `<C-x>` chords.
- **Lesson data validation test**: iterates all lessons — unique lesson and
  challenge ids, `par >= 1`, target state differs from start state, non-empty
  instructions.
- **Engine smoke test**: create editor, verify text/cursor/mode reporting and
  programmatic reset (jsdom).
- Manual playtesting of the curriculum in the browser.

## Out of scope (YAGNI)

- Accounts, sync, or any backend.
- Ex commands (`:s`, `:g`), splits/windows/tabs, plugins, vimscript.
- Mobile support; desktop browser only.
- Gamification beyond par (no XP, streaks, leaderboards).
