# Lesson Cleanup & Chapter Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lessons drill only their own keys; mixed review moves to explicit end-of-chapter revision pages; plus four UX fixes (short o/O typing, truncated ghosts, on-demand hint chip, conditional undo hint).

**Architecture:** Lesson data files (`src/lessons/*.ts`) get trimmed generator lists; `src/lessons/index.ts` grows a chapter model (`chapters`, `getChapter`, `chapterPool`, `cumulativePool`) replacing `revisionGenerators`; a new `src/ui/revision.ts` page reuses `renderLesson` via a small options parameter; `#/revision/<slug>` routes to it from sidebar entries.

**Tech Stack:** TypeScript, Vite, CodeMirror 6 + @replit/codemirror-vim, vitest (jsdom). No new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-03-lesson-cleanup-chapter-revisions-design.md`.
- Run tests with `npx vitest run` (or `npm test`) from `C:/Development/Projekte/learn-vim`.
- Ghost display cap: 24 chars (21 + `…`).
- Revision task counts: 10 (chapter scope), 15 (everything scope).
- Revision progress id: `rev:<chapter-slug>`; everything-scope runs recorded with `revised: true`.
- `SHORT_SNIPPETS`: every line ≤ 16 chars, indent 0, no blank lines, ≥ 5 lines, ≥ 4 variants.
- Follow existing code style: JSDoc one-liners, no superfluous comments, `md()` for backtick rendering.

---

### Task 1: Trim lesson generators to their own keys; delete the capstone

**Files:**
- Modify: 22 files under `src/lessons/` (table below)
- Delete: `src/lessons/30-capstone.ts`
- Modify: `src/lessons/index.ts` (imports + array only)
- Test: `tests/lessons.test.ts`

**Interfaces:**
- Produces: `lessons` array now has 29 entries; every lesson's `generators` match its own `keys`. No API change.

- [ ] **Step 1: Update the lesson-count test to the post-change reality**

In `tests/lessons.test.ts` change the first test:

```ts
  it("has 29 lessons in strictly ascending order with unique ids", () => {
    expect(lessons.length).toBe(29);
```

(keep the rest of that test body unchanged).

- [ ] **Step 2: Run tests to verify the count test fails**

Run: `npx vitest run tests/lessons.test.ts`
Expected: FAIL — "expected 30 to be 29".

- [ ] **Step 3: Trim each lesson's generators and imports**

For each file, replace the `generators:` line and shrink the `import { … } from "./gen";` line to exactly what is still used:

| File | New `generators:` line |
|---|---|
| `03-moving-by-words.ts` | `generators: [moveWordStart(), moveWordEnd()],` |
| `04-insert-mode.ts` | `generators: [insertMissing(), typeFresh()],` |
| `05-insert-at-line-ends.ts` | `generators: [insertStart(), appendEnd()],` |
| `06-opening-new-lines.ts` | `generators: [openLine("o"), openLine("O")],` |
| `08-moving-by-big-words.ts` | `generators: [moveBigWord()],` |
| `09-line-ends.ts` | `generators: [moveLineEdge("0"), moveLineEdge("^"), moveLineEdge("$")],` |
| `10-find-character.ts` | `generators: [findChar("f"), findChar("F")],` |
| `11-till-character.ts` | `generators: [tillChar("t"), tillChar("T")],` |
| `12-delete-words.ts` | `generators: [deleteWord("dw"), deleteWord("daw"), deleteTwoWords()],` |
| `13-change-words.ts` | `generators: [changeWord("cw"), changeWord("ciw")],` |
| `14-delete-lines.ts` | `generators: [deleteLine(), deleteToEnd(), deleteLinesDown()],` |
| `15-copy-paste-lines.ts` | `generators: [duplicateLine(), copyLineTo()],` |
| `16-repeat-and-join.ts` | `generators: [dotRepeat(), joinLines()],` |
| `17-relative-jumps.ts` | `generators: [relativeJump()],` |
| `18-absolute-jumps.ts` | `generators: [gotoLine()],` |
| `19-paragraph-jumps.ts` | `generators: [paraJump()],` |
| `20-search.ts` | `generators: [searchSlash()],` |
| `21-quick-word-search.ts` | `generators: [searchWord("*"), searchWord("#")],` |
| `25-visual-mode.ts` | `generators: [visualDeleteSpan()],` |
| `26-visual-line.ts` | `generators: [visualDeleteLines()],` |
| `27-moving-lines.ts` | `generators: [moveLineDown(), moveLineTo()],` |
| `28-marks.ts` | `generators: [markRoundTrip()],` |

Untouched: 01, 02, 07, 22, 23, 24, 29.

- [ ] **Step 4: Delete the capstone**

Delete `src/lessons/30-capstone.ts`. In `src/lessons/index.ts` remove the line `import { lesson as l30 } from "./30-capstone";` and remove `l30` from the `lessons` array (line ends `l29,`).

- [ ] **Step 5: Run the whole suite**

Run: `npx vitest run`
Expected: PASS everywhere. If `tests/home.test.ts` or `tests/smoke.test.ts` assert a lesson count or capstone title, update those assertions to 29 / remove the capstone reference — nothing else.

- [ ] **Step 6: Commit**

```bash
git add -A src/lessons tests
git commit -m "feat: lessons drill only their own keys; drop capstone"
```

---

### Task 2: SHORT_SNIPPETS for the o/O lesson

**Files:**
- Modify: `src/lessons/gen.ts` (add pool next to `LIST_SNIPPETS`)
- Modify: `src/lessons/06-opening-new-lines.ts`
- Test: `tests/lessons.test.ts`

**Interfaces:**
- Produces: `export const SHORT_SNIPPETS: Snippet[]` in `src/lessons/gen.ts`.

- [ ] **Step 1: Write the failing test**

Append to the `describe("lesson data", …)` block in `tests/lessons.test.ts` (import `SHORT_SNIPPETS` from `../src/lessons/gen`):

```ts
  it("opening-new-lines uses short-line snippets so typing stays minimal", () => {
    const l06 = lessons.find((l) => l.id === "06-opening-new-lines")!;
    expect(l06.snippets).toBe(SHORT_SNIPPETS);
    expect(SHORT_SNIPPETS.length).toBeGreaterThanOrEqual(4);
    for (const snip of SHORT_SNIPPETS) {
      expect(snip.length).toBeGreaterThanOrEqual(5);
      for (const line of snip) {
        expect(line.length).toBeLessThanOrEqual(16);
        expect(line).toBe(line.trimStart());
        expect(line.trim()).not.toBe("");
      }
    }
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/lessons.test.ts`
Expected: FAIL — `SHORT_SNIPPETS` is not exported.

- [ ] **Step 3: Implement**

In `src/lessons/gen.ts`, after `LIST_SNIPPETS`:

```ts
/** Short flat lines (≤16 chars, indent 0) for o/O drills: minimal typing. */
export const SHORT_SNIPPETS: Snippet[] = [
  ["mode: dark", "size: 14", "wrap: true", "ruler: off", "theme: mono"],
  ["host: local", "port: 8080", "debug: false", "retry: 3", "log: warn"],
  ["- eggs", "- flour", "- milk", "- sugar", "- salt", "- butter"],
  ["step: fetch", "step: parse", "step: check", "step: build", "step: ship"],
];
```

In `src/lessons/06-opening-new-lines.ts` import `SHORT_SNIPPETS`, add `snippets: SHORT_SNIPPETS,` after `generators`, and replace the second intro paragraph with:

```ts
    "Put the cursor on the marked line, open a line in the right direction, type the short missing entry, press `Esc`.",
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/lessons.test.ts`
Expected: PASS — including the existing "well-formed tasks for every snippet" test, which now exercises `openLine` on every `SHORT_SNIPPETS` variant across 25 seeds.

- [ ] **Step 5: Commit**

```bash
git add src/lessons/gen.ts src/lessons/06-opening-new-lines.ts tests/lessons.test.ts
git commit -m "feat: short-line snippets for the o/O lesson"
```

---

### Task 3: Truncate long ghost widgets

**Files:**
- Modify: `src/engine/editor.ts` (GhostWidget.toDOM)
- Test: `tests/editor.test.ts`

- [ ] **Step 1: Write the failing test**

Append inside `describe("createEditor", …)` in `tests/editor.test.ts`:

```ts
  it("truncates long ghost text but keeps short ghosts whole", () => {
    const long = createEditor({
      parent,
      doc: "a",
      targetText: 'a\nconst demo = parseLine("mode,dark,wide");',
    });
    const ghost = parent.querySelector(".lv-ghost")!.textContent!;
    expect(ghost.length).toBeLessThanOrEqual(24);
    expect(ghost.endsWith("…")).toBe(true);
    long.destroy();

    const short = createEditor({ parent, doc: "a\nc", targetText: "a\nb\nc" });
    expect(parent.querySelector(".lv-ghost")!.textContent).toBe("⏎b");
    short.destroy();
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/editor.test.ts`
Expected: FAIL — ghost length > 24.

- [ ] **Step 3: Implement**

In `src/engine/editor.ts`, `GhostWidget.toDOM()`:

```ts
  override toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.className = "lv-ghost";
    const text = this.text.replace(/\n/g, "⏎");
    // Long ghosts (whole copied lines) only mark a position; cap the noise.
    el.textContent = text.length > 24 ? text.slice(0, 21) + "…" : text;
    return el;
  }
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/editor.test.ts`
Expected: PASS (existing ghost tests use short texts and stay green).

- [ ] **Step 5: Commit**

```bash
git add src/engine/editor.ts tests/editor.test.ts
git commit -m "fix: cap ghost marker text at 24 chars"
```

---

### Task 4: Undo hint only when the buffer got worse

**Files:**
- Modify: `src/challenge/drill.ts` (add `charsWrong`)
- Modify: `src/ui/lesson.ts`
- Modify: `src/style.css` (`.hidden` utility if not present)
- Test: `tests/drill.test.ts`, `tests/lesson-view.test.ts`

**Interfaces:**
- Produces: `export function charsWrong(a: string, b: string): number` in `src/challenge/drill.ts`.

- [ ] **Step 1: Write the failing unit tests**

Append to `tests/drill.test.ts`:

```ts
import { charsWrong } from "../src/challenge/drill";

describe("charsWrong", () => {
  it("is 0 for identical strings", () => {
    expect(charsWrong("hello", "hello")).toBe(0);
  });
  it("counts differing middles from both sides", () => {
    expect(charsWrong("abc", "axc")).toBe(2);
    expect(charsWrong("hello", "helo")).toBe(1);
    expect(charsWrong("", "abc")).toBe(3);
  });
  it("grows when an edit moves away from the target", () => {
    const target = "hello";
    const baseline = charsWrong("xhello", target);
    expect(charsWrong("zxhello", target)).toBeGreaterThan(baseline);
    expect(charsWrong("hello", target)).toBeLessThan(baseline);
  });
});
```

(adjust the import line to merge with the file's existing imports).

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/drill.test.ts`
Expected: FAIL — `charsWrong` not exported.

- [ ] **Step 3: Implement `charsWrong`**

Append to `src/challenge/drill.ts`:

```ts
/**
 * How far a buffer is from a target: chars left in each after trimming the
 * common prefix and suffix. Used to detect edits that made things worse.
 */
export function charsWrong(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let p = 0;
  while (p < max && a[p] === b[p]) p++;
  let s = 0;
  while (s < max - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return a.length - p - s + (b.length - p - s);
}
```

Run: `npx vitest run tests/drill.test.ts` — PASS.

- [ ] **Step 4: Write the failing view test**

Append to `tests/lesson-view.test.ts`:

```ts
  it("shows the undo hint only after an edit made things worse", () => {
    cleanup = renderLesson(app, lesson);
    const hint = () => app.querySelector<HTMLElement>(".undo-hint")!;
    expect(hint().classList.contains("hidden")).toBe(true);
    press("x"); // solves task 1 — never worse than the start
    expect(hint().classList.contains("hidden")).toBe(true);
  });

  it("reveals the undo hint after typing junk in insert mode", () => {
    cleanup = renderLesson(app, lesson);
    press("i");
    press("z");
    expect(app.querySelector(".undo-hint")!.classList.contains("hidden")).toBe(false);
  });
```

Run: `npx vitest run tests/lesson-view.test.ts` — Expected: FAIL (hint never has `hidden`).

- [ ] **Step 5: Implement in the lesson view**

In `src/ui/lesson.ts`:

1. Import: `import { Drill, randomSeed, charsWrong } from "../challenge/drill";`
2. In the `mountTask()` template, change the undo-hint span to start hidden:

```html
        <span class="stat undo-hint hidden"><kbd>Esc</kbd> <kbd>u</kbd> to undo</span>
```

3. After the `timerEl` assignments in `mountTask()`:

```ts
    const undoHintEl = body.querySelector<HTMLElement>(".undo-hint")!;
    const baseline = charsWrong(task.startText, task.targetText);
```

4. In `checkNow()` (which runs on every change), before the solved check:

```ts
      undoHintEl.classList.toggle("hidden", charsWrong(editor.getText(), task.targetText) <= baseline);
```

Place it right after the `if (advancing || !editor) return;` guard.

5. In `src/style.css`, add (near the top utilities, if no `.hidden` rule exists):

```css
.hidden { display: none !important; }
```

- [ ] **Step 6: Run the suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/challenge/drill.ts src/ui/lesson.ts src/style.css tests/drill.test.ts tests/lesson-view.test.ts
git commit -m "feat: undo hint appears only when edits diverge from the solution"
```

---

### Task 5: Key hint hidden behind a hint button

**Files:**
- Modify: `src/ui/lesson.ts`
- Modify: `src/style.css`
- Test: `tests/lesson-view.test.ts`

- [ ] **Step 1: Write the failing test**

Replace the existing `"shows the task instruction, key hint, and red mark"` test in `tests/lesson-view.test.ts` with:

```ts
  it("hides the key hint until the hint button is clicked", () => {
    cleanup = renderLesson(app, lesson);
    expect(app.querySelector(".task-instruction")!.textContent).toContain("Delete the highlighted letter");
    expect(app.querySelector(".lv-mark")).not.toBeNull();
    const chip = app.querySelector<HTMLElement>(".key-chip")!;
    expect(chip.classList.contains("hidden")).toBe(true);
    app.querySelector<HTMLButtonElement>(".hint-btn")!.click();
    expect(chip.classList.contains("hidden")).toBe(false);
    expect(chip.textContent).toBe("x");
  });
```

Run: `npx vitest run tests/lesson-view.test.ts` — Expected: FAIL.

- [ ] **Step 2: Implement**

In `src/ui/lesson.ts` `mountTask()` template, replace the key-chip line:

```html
        ${task.keyHint ? `<button class="ghost hint-btn" title="Show which keys to use">hint?</button><span class="key-chip hidden">${task.keyHint}</span>` : ""}
```

After the template, wire it (guarded — the button only exists when there is a hint):

```ts
    const hintBtn = body.querySelector<HTMLButtonElement>(".hint-btn");
    hintBtn?.addEventListener("click", () => {
      body.querySelector(".key-chip")!.classList.remove("hidden");
      hintBtn.classList.add("hidden");
    });
```

In `src/style.css` next to `.key-chip`:

```css
.hint-btn { flex: none; font-size: 0.75rem; }
```

(the existing `.ghost` button rule supplies the base look — verify it exists; it styles the `reset task` button.)

- [ ] **Step 3: Run the suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/lesson.ts src/style.css tests/lesson-view.test.ts
git commit -m "feat: key hint shown only on explicit request"
```

---

### Task 6: Remove per-lesson revision mixing

**Files:**
- Modify: `src/ui/lesson.ts`
- Modify: `src/challenge/drill.ts` (drop the generators override param)
- Test: `tests/lesson-view.test.ts`

**Interfaces:**
- Produces: `new Drill(lesson, seed)` — two args only. `renderLesson` unchanged externally (options come in Task 8).
- Note: `revisionGenerators` still exists in `src/lessons/index.ts` after this task but has no callers; Task 7 replaces it.

- [ ] **Step 1: Update tests**

In `tests/lesson-view.test.ts` replace the `"offers a revision rerun and lists previous runs"` test with:

```ts
  it("lists previous runs and offers no per-lesson revision rerun", async () => {
    cleanup = renderLesson(app, lesson);
    expect(app.querySelector(".runs-list")!.textContent).toContain("no runs yet");
    press("x");
    await settle();
    press("x");
    await settle();
    expect(app.querySelectorAll(".runs-list li").length).toBe(1);
    expect(app.querySelector(".again-rev")).toBeNull();
    expect(app.textContent).not.toContain("with revisions");
  });
```

Run: `npx vitest run tests/lesson-view.test.ts` — Expected: FAIL (`.again-rev` exists).

- [ ] **Step 2: Implement**

In `src/challenge/drill.ts`:
- Constructor signature becomes `constructor(lesson: Lesson, seed: number)`.
- Body: `const pool = lesson.generators;` and `const base = pick(rng, lesson.snippets ?? SNIPPETS);`
- Remove the now-unused `TaskGen` import if nothing else uses it.
- Update the class JSDoc: drop the sentence about custom pools.

In `src/ui/lesson.ts`:
- Remove `revisionGenerators` from the import of `../lessons/index`.
- Remove `let revised = false;`.
- `restart()` takes no parameter: `drill = new Drill(lesson, randomSeed());`.
- `updateHead()`: drop the `rev` suffix (plain `Drill complete` / `Task x of y`).
- `finish()`: `recordResult(lesson.id, res.timeMs, res.keystrokes);` and best checks lose the `!revised &&` prefix; remove the `again-rev` button and its listener; the restart button listener becomes `() => restart()`.
- Keep the `run-rev` tag rendering in `renderRuns()` (old stored runs may carry it; Task 8 reuses it).

- [ ] **Step 3: Run the suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/lesson.ts src/challenge/drill.ts tests/lesson-view.test.ts
git commit -m "feat: drop per-lesson revision mixing"
```

---

### Task 7: Chapter model in lessons/index.ts

**Files:**
- Modify: `src/lessons/index.ts`
- Test: `tests/lessons.test.ts`

**Interfaces:**
- Produces (all from `src/lessons/index.ts`):
  - `export type Chapter = { name: string; slug: string; lessons: Lesson[] };`
  - `export function chapters(): Chapter[]`
  - `export function getChapter(slug: string): Chapter | undefined`
  - `export function chapterPool(ch: Chapter): TaskGen[]` — generators of the chapter's lessons, excluding custom-snippet lessons.
  - `export function cumulativePool(ch: Chapter): TaskGen[]` — generators of ALL lessons with `order <=` the chapter's last lesson, same exclusion.
- Removes: `revisionGenerators`.

- [ ] **Step 1: Replace the revision-pool test**

In `tests/lessons.test.ts`, replace the `"revision pools grow with the lesson and skip custom-snippet lessons"` test (and the `revisionGenerators` import) with:

```ts
import { lessons, chapters, getChapter, chapterPool, cumulativePool } from "../src/lessons/index";
```

```ts
  it("chapters cover all lessons in order with unique slugs", () => {
    const chs = chapters();
    expect(chs.map((c) => c.name)).toEqual([
      "Basics", "Insert Like a Pro", "Essential Motions", "Operators",
      "Vertical Motions", "Search", "Text Objects", "Visual Mode", "Power Tools",
    ]);
    expect(new Set(chs.map((c) => c.slug)).size).toBe(chs.length);
    expect(chs.flatMap((c) => c.lessons)).toEqual(lessons);
    expect(getChapter(chs[2].slug)?.name).toBe("Essential Motions");
    expect(getChapter("nope")).toBeUndefined();
  });

  it("revision pools are non-empty and skip custom-snippet lessons", () => {
    for (const ch of chapters()) {
      const own = chapterPool(ch);
      const all = cumulativePool(ch);
      expect(own.length, ch.slug).toBeGreaterThan(0);
      expect(all.length, ch.slug).toBeGreaterThanOrEqual(own.length);
      for (const l of lessons.filter((x) => x.snippets)) {
        for (const g of l.generators) {
          expect(own, ch.slug).not.toContain(g);
          expect(all, ch.slug).not.toContain(g);
        }
      }
    }
    const last = chapters().at(-1)!;
    const covered = lessons.filter((l) => !l.snippets).flatMap((l) => l.generators);
    expect(cumulativePool(last)).toEqual(covered);
  });
```

Run: `npx vitest run tests/lessons.test.ts` — Expected: FAIL (no `chapters` export).

- [ ] **Step 2: Implement**

In `src/lessons/index.ts`, replace `revisionGenerators` with:

```ts
export type Chapter = { name: string; slug: string; lessons: Lesson[] };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Lessons grouped by section, in curriculum order. */
export function chapters(): Chapter[] {
  const out: Chapter[] = [];
  for (const lesson of lessons) {
    const last = out[out.length - 1];
    if (last?.name === lesson.section) last.lessons.push(lesson);
    else out.push({ name: lesson.section, slug: slugify(lesson.section), lessons: [lesson] });
  }
  return out;
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters().find((c) => c.slug === slug);
}

/**
 * Revision pools exclude lessons on custom snippets — their generators
 * (macros, o/O) aren't safe or sensible on the shared code snippets.
 */
export function chapterPool(ch: Chapter): TaskGen[] {
  return ch.lessons.filter((l) => !l.snippets).flatMap((l) => l.generators);
}

export function cumulativePool(ch: Chapter): TaskGen[] {
  const lastOrder = ch.lessons[ch.lessons.length - 1].order;
  return lessons.filter((l) => l.order <= lastOrder && !l.snippets).flatMap((l) => l.generators);
}
```

- [ ] **Step 3: Run the suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lessons/index.ts tests/lessons.test.ts
git commit -m "feat: chapter model with chapter and cumulative revision pools"
```

---

### Task 8: Revision route, page, and sidebar entries

**Files:**
- Modify: `src/ui/router.ts`, `src/ui/lesson.ts`, `src/ui/sidebar.ts`, `src/main.ts`, `src/style.css`
- Create: `src/ui/revision.ts`
- Test: `tests/router.test.ts`, create `tests/revision-view.test.ts`

**Interfaces:**
- Consumes: `chapters`, `getChapter`, `chapterPool`, `cumulativePool` (Task 7); `renderLesson` (Task 6 state).
- Produces:
  - `Route` union gains `{ screen: "revision"; chapterSlug: string }`.
  - `export type LessonViewOptions = { crumb?: string; revised?: boolean; revisedTag?: string; exit?: { label: string; onClick: () => void } };`
  - `renderLesson(app: HTMLElement, lesson: Lesson, opts?: LessonViewOptions): () => void`
  - `export function renderRevision(app: HTMLElement, chapter: Chapter): () => void` in `src/ui/revision.ts`.

- [ ] **Step 1: Router test + implementation**

Append to `tests/router.test.ts`:

```ts
  it("parses revision routes", () => {
    expect(parseRoute("#/revision/essential-motions")).toEqual({
      screen: "revision",
      chapterSlug: "essential-motions",
    });
    expect(parseRoute("#/revision/")).toEqual({ screen: "home" });
  });
```

Run: `npx vitest run tests/router.test.ts` — FAIL. Then in `src/ui/router.ts`:

```ts
export type Route =
  | { screen: "home" }
  | { screen: "lesson"; lessonId: string }
  | { screen: "revision"; chapterSlug: string };

export function parseRoute(hash: string): Route {
  const lesson = hash.match(/^#\/lesson\/([\w-]+)$/);
  if (lesson) return { screen: "lesson", lessonId: lesson[1] };
  const revision = hash.match(/^#\/revision\/([\w-]+)$/);
  if (revision) return { screen: "revision", chapterSlug: revision[1] };
  return { screen: "home" };
}
```

Run again — PASS.

- [ ] **Step 2: Extend renderLesson with view options**

In `src/ui/lesson.ts`:

```ts
export type LessonViewOptions = {
  /** Crumb line above the title; defaults to "Section · Lesson N". */
  crumb?: string;
  /** Record runs as revised: kept in history, excluded from bests. */
  revised?: boolean;
  /** Tag shown on revised runs in the history (default "revision"). */
  revisedTag?: string;
  /** Extra results-screen action (revision scope chooser). */
  exit?: { label: string; onClick: () => void };
};

export function renderLesson(app: HTMLElement, lesson: Lesson, opts: LessonViewOptions = {}): () => void {
```

- Crumb: `<p class="crumb">${opts.crumb ?? `${lesson.section} · Lesson ${lesson.order}`}</p>`
- `renderRuns()` tag: `${r.revised ? `<span class="run-rev">${opts.revisedTag ?? "revision"}</span>` : ""}`
- `finish()`: `recordResult(lesson.id, res.timeMs, res.keystrokes, opts.revised ?? false);` and both `newBest*` get a `!opts.revised &&` prefix again (revised runs never claim bests).
- Results actions:

```html
        <div class="results-actions">
          <button class="primary again">↻ Run again</button>
          ${opts.exit ? `<button class="exit-view">${opts.exit.label}</button>` : ""}
        </div>
```

```ts
    body.querySelector<HTMLButtonElement>(".exit-view")?.addEventListener("click", () => opts.exit!.onClick());
```

- [ ] **Step 3: Revision page**

Create `src/ui/revision.ts`:

```ts
import type { Chapter } from "../lessons/index";
import { chapterPool, cumulativePool } from "../lessons/index";
import type { Lesson } from "../lessons/types";
import { renderLesson } from "./lesson";

/**
 * End-of-chapter revision: a scope chooser (this chapter / everything so
 * far), then a normal drill over the chosen generator pool. Runs are
 * recorded under "rev:<slug>"; everything-scope runs never touch bests.
 */
export function renderRevision(app: HTMLElement, chapter: Chapter): () => void {
  let inner: (() => void) | null = null;

  function start(scope: "chapter" | "all"): void {
    const pool = scope === "chapter" ? chapterPool(chapter) : cumulativePool(chapter);
    const lesson: Lesson = {
      id: `rev:${chapter.slug}`,
      title: `Revision: ${chapter.name}`,
      section: chapter.name,
      order: 0,
      intro: [
        scope === "chapter"
          ? `A mixed drill over everything from **${chapter.name}**.`
          : `A mixed drill over everything you have learned up to and including **${chapter.name}**.`,
        "Prefer the shortest command over fast typing. Rerun for a new set of tasks.",
      ],
      keys: chapter.lessons.flatMap((l) => l.keys),
      taskCount: scope === "chapter" ? 10 : 15,
      generators: pool,
    };
    inner?.();
    inner = renderLesson(app, lesson, {
      crumb: `${chapter.name} · Chapter revision`,
      revised: scope === "all",
      revisedTag: "everything",
      exit: { label: "↺ choose scope", onClick: chooser },
    });
  }

  function chooser(): void {
    inner?.();
    inner = null;
    app.innerHTML = "";
    const root = document.createElement("div");
    root.className = "lesson revision-chooser";
    root.innerHTML = `
      <header class="lesson-header">
        <p class="crumb">${chapter.name} · Chapter revision</p>
        <h1>Revision: ${chapter.name}</h1>
      </header>
      <div class="scope-cards">
        <button class="scope-card scope-chapter">
          <span class="scope-title">Revise this chapter</span>
          <span class="scope-desc">10 tasks from ${chapter.lessons.map((l) => l.title).join(", ")}</span>
        </button>
        <button class="scope-card scope-all">
          <span class="scope-title">Revise everything so far</span>
          <span class="scope-desc">15 tasks from every lesson up to here</span>
        </button>
      </div>
    `;
    app.appendChild(root);
    root.querySelector(".scope-chapter")!.addEventListener("click", () => start("chapter"));
    root.querySelector(".scope-all")!.addEventListener("click", () => start("all"));
  }

  chooser();
  return () => inner?.();
}
```

- [ ] **Step 4: Sidebar entries**

In `src/ui/sidebar.ts`, build from chapters instead of a local grouping:

```ts
import { chapters } from "../lessons/index";
import { isLessonDone } from "../progress/store";

/** vim-hero-style curriculum nav: every lesson, grouped by chapter, plus a revision entry per chapter. */
export function renderSidebar(el: HTMLElement, currentId: string | null): void {
  el.innerHTML = "";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "#/";
  brand.textContent = "learn-vim";
  el.appendChild(brand);

  for (const chapter of chapters()) {
    const h = document.createElement("h3");
    h.textContent = chapter.name;
    el.appendChild(h);

    const list = document.createElement("ul");
    list.className = "nav-list";
    for (const lesson of chapter.lessons) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#/lesson/${lesson.id}`;
      a.className = lesson.id === currentId ? "nav-link current" : "nav-link";
      const done = isLessonDone(lesson.id);
      a.innerHTML = `<span class="nav-title">${lesson.title}</span><span class="nav-check">${done ? "✓" : ""}</span>`;
      li.appendChild(a);
      list.appendChild(li);
    }
    const revId = `rev:${chapter.slug}`;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#/revision/${chapter.slug}`;
    a.className = revId === currentId ? "nav-link nav-revision current" : "nav-link nav-revision";
    a.innerHTML = `<span class="nav-title">↻ Revision</span><span class="nav-check">${isLessonDone(revId) ? "✓" : ""}</span>`;
    li.appendChild(a);
    list.appendChild(li);
    el.appendChild(list);
  }
}
```

- [ ] **Step 5: Wire main.ts**

In `src/main.ts`, import `renderRevision` and `getChapter`, and add a branch:

```ts
  } else if (route.screen === "revision") {
    const chapter = getChapter(route.chapterSlug);
    if (!chapter) {
      location.hash = "#/";
      return;
    }
    renderSidebar(sidebar, `rev:${chapter.slug}`);
    cleanup = renderRevision(main, chapter);
  } else {
```

- [ ] **Step 6: Styles**

Append to `src/style.css` (near the results/nav sections):

```css
/* ------------------------------------------------------------- revision */

.nav-revision .nav-title { color: var(--accent); font-style: italic; }

.scope-cards { display: flex; gap: 16px; flex-wrap: wrap; }
.scope-card {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  text-align: left;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  font: inherit;
}
.scope-card:hover { border-color: var(--accent); background: var(--panel-2); }
.scope-title { font-weight: 600; font-size: 1.05rem; color: var(--accent); }
.scope-desc { font-size: 0.85rem; color: var(--dim); line-height: 1.5; }
```

(Verify the CSS custom properties used — `--panel`, `--panel-2`, `--border`, `--accent`, `--dim`, `--text` — exist in `:root`; substitute the file's actual token names if they differ.)

- [ ] **Step 7: View test**

Create `tests/revision-view.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderRevision } from "../src/ui/revision";
import { chapters } from "../src/lessons/index";

let app: HTMLElement;
let cleanup: (() => void) | null = null;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  app = document.querySelector<HTMLElement>("#app")!;
});

afterEach(() => {
  cleanup?.();
  cleanup = null;
});

describe("renderRevision", () => {
  it("shows a scope chooser first", () => {
    cleanup = renderRevision(app, chapters()[2]);
    expect(app.querySelector("h1")!.textContent).toContain("Revision: Essential Motions");
    expect(app.querySelector(".scope-chapter")).not.toBeNull();
    expect(app.querySelector(".scope-all")).not.toBeNull();
    expect(app.querySelector(".cm-editor")).toBeNull();
  });

  it("starts a 10-task chapter drill", () => {
    cleanup = renderRevision(app, chapters()[2]);
    app.querySelector<HTMLButtonElement>(".scope-chapter")!.click();
    expect(app.querySelector(".cm-editor")).not.toBeNull();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 10");
  });

  it("starts a 15-task everything drill", () => {
    cleanup = renderRevision(app, chapters()[2]);
    app.querySelector<HTMLButtonElement>(".scope-all")!.click();
    expect(app.querySelector(".drill-count")!.textContent).toBe("Task 1 of 15");
  });
});
```

Also update `tests/home.test.ts` / sidebar assertions if they count `.nav-link` elements (each chapter now adds one more).

- [ ] **Step 8: Run the whole suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/ui tests src/main.ts src/style.css
git commit -m "feat: end-of-chapter revision pages with chapter/everything scope"
```

---

### Task 9: Home copy + final verification

**Files:**
- Modify: `src/ui/home.ts`
- Test: full suite + typecheck + build

- [ ] **Step 1: Update the tagline**

In `src/ui/home.ts` (the count is now 29 and revisions exist):

```html
    <p class="tagline">Drill-based lessons from <kbd>hjkl</kbd> to macros, with a revision drill at the end of every chapter.
    Every drill perturbs one code snippet with randomized tasks and times the run. Beat your best.</p>
```

- [ ] **Step 2: Full verification**

Run: `npx vitest run` — Expected: PASS, all files. If `tests/home.test.ts` asserts the old tagline text, update that assertion to match the new copy.
Run: `npm run build` — Expected: tsc + vite build succeed with no type errors.

- [ ] **Step 3: Manual verify (superpowers:verification-before-completion + verify skill)**

Start `npm run dev` and check in the browser:
1. Copy/paste lesson (15): ghost marker is now a short `⏎ const parts = raw.t…` box, not a full line.
2. o/O lesson (06): short config lines to type; instruction matches.
3. Any lesson: key chip hidden until `hint?` clicked; undo hint appears only after typing junk; no "Run again with revisions" on results.
4. Till lesson (11): only `t`/`T` tasks appear.
5. Sidebar: ↻ Revision after each chapter; chooser → chapter drill (10) and everything drill (15); finishing records a ✓ on the revision entry.

- [ ] **Step 4: Commit**

```bash
git add src/ui/home.ts
git commit -m "docs: home copy reflects chapter revisions"
```
