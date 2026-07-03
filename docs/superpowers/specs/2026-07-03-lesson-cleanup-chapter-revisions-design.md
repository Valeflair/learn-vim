# Lesson Cleanup & Chapter Revisions — Design

Date: 2026-07-03
Status: approved

Seven user-reported issues, resolved by one coherent change set: lessons drill
only their own keys, mixed review moves into explicit end-of-chapter revision
pages, and four smaller UX fixes (typing load, ghost size, hint visibility,
undo hint).

## 1. Lessons drill only their own keys

Every lesson's `generators` list is reduced to the generators that match its
own `keys` list. All baked-in review generators are removed:

| Lesson | Remove | Keep |
|---|---|---|
| 03 moving-by-words | `gridMove` | `moveWordStart`, `moveWordEnd` |
| 04 insert-mode | `moveWordStart` | `insertMissing`, `typeFresh` |
| 05 insert-at-line-ends | `insertMissing` | `insertStart`, `appendEnd` |
| 06 opening-new-lines | `appendEnd` | `openLine("o")`, `openLine("O")` |
| 08 moving-by-big-words | `moveWordStart`, `moveWordEnd` | `moveBigWord` |
| 09 line-ends | `moveBigWord` | `moveLineEdge` ×3 |
| 10 find-character | `moveLineEdge("$")` | `findChar` ×2 |
| 11 till-character | `findChar("f")` | `tillChar` ×2 |
| 12 delete-words | `deleteChar` | `deleteWord` ×2, `deleteTwoWords` |
| 13 change-words | `deleteWord("dw")` | `changeWord` ×2 |
| 14 delete-lines | `deleteWord("daw")` | `deleteLine`, `deleteToEnd`, `deleteLinesDown` |
| 15 copy-paste-lines | `deleteLine` | `duplicateLine`, `copyLineTo` |
| 16 repeat-and-join | `deleteLine` | `dotRepeat`, `joinLines` |
| 17 relative-jumps | `gridMove` | `relativeJump` |
| 18 absolute-jumps | `relativeJump` | `gotoLine` |
| 19 paragraph-jumps | `gotoLine`, `relativeJump` | `paraJump` |
| 20 search | `findChar("f")` | `searchSlash` |
| 21 quick-word-search | `searchSlash` | `searchWord` ×2 |
| 25 visual-mode | `changeWord("ciw")` | `visualDeleteSpan` |
| 26 visual-line | `visualDeleteSpan` | `visualDeleteLines` |
| 27 moving-lines | `copyLineTo` | `moveLineDown`, `moveLineTo` |
| 28 marks | `gotoLine` | `markRoundTrip` |

Lessons 01, 02, 07, 22, 23, 24, 29 already drill only their own keys
(lesson 24's `keys` list `daw`/`ciw`/`dip`/`dap`, so all four of its
generators are its own).

This directly fixes the Till Character complaint: the contradictory
"Jump onto…" `f` review tasks no longer appear there.

**Capstone (lesson 30) is removed entirely** — replaced by the Power Tools
chapter revision with "everything so far" scope. Its file, import, and array
entry are deleted. Any stored progress for `30-capstone` is simply orphaned
data (harmless).

**Repeat & Join audit result:** `joinLines` and `dotRepeat` are sound
(single-space split ↔ `J` semantics match exactly; `.` is supported by
@replit/codemirror-vim). No changes beyond removing the `deleteLine` review.

## 2. Short-line snippets for o/O

New `SHORT_SNIPPETS` pool in `gen.ts`: flat config/list-style texts, every
line ≤ ~16 chars, all at indent 0, ≥ 5 lines, e.g.

```
mode: dark
size: 14
wrap: true
ruler: off
theme: mono
```

At least 4 snippet variants. Lesson 06 sets `snippets: SHORT_SNIPPETS` and
uses only the `openLine` generators. Because custom-snippet lessons are
excluded from revision pools, whole-line typing never appears in revisions.

`openLine` candidate rules (indent-0 line, blank-or-indent-0 neighbor) must
hold for every snippet variant.

## 3. Ghost marker truncation

`GhostWidget.toDOM()` caps rendered text at 24 chars (21 + `…`). Position is
preserved; ghosts that must be read in full (missing word, ≤14-char line
tail, short o/O lines) are all under the cap. Widget `eq()` still compares
the full text.

## 4. Hint chip on demand

The `key-chip` next to the task instruction is hidden by default. A small
`hint?` ghost-button sits at the top-right of the editor (in the instruction
row); clicking it reveals the chip for the current task only. Each new task
resets to hidden. No keyboard shortcut.

## 5. Undo hint only when the user made it worse

Wrongness metric: `wrong(a, b)` = chars remaining in `a` plus chars remaining
in `b` after trimming the common prefix and suffix. Baseline =
`wrong(startText, targetText)` computed at task mount. On every editor change,
show the `Esc u to undo` status-bar item iff
`wrong(currentText, targetText) > baseline`; hide otherwise. Lives in
`lesson.ts` (uses `editor.getText()` in the change callback).

## 6. Chapter revision pages

- **Chapters** = the ordered distinct `section` values (9 after capstone
  removal: Basics, Insert Like a Pro, Essential Motions, Operators,
  Vertical Motions, Search, Text Objects, Visual Mode, Power Tools).
- **Sidebar:** after each chapter's lessons, one visually distinct
  "↻ Revision" entry with the usual ✓ done-check.
- **Route:** `#/revision/<chapter-slug>` (slug = kebab-cased section name).
- **Page:** same lesson layout; instead of auto-starting, a scope chooser:
  - **Revise this chapter** — 10 tasks from the chapter's lessons' generators.
  - **Revise everything so far** — 15 tasks from all lessons with
    `order <=` the chapter's last lesson.
  Both pools exclude custom-snippet lessons (06, 29), as `revisionGenerators`
  does today. The aside shows the chapter's combined key reference.
- **Progress:** recorded under `rev:<slug>` via the existing store.
  Chapter-scope runs update bests; everything-scope runs pass `revised: true`
  (history only, no bests). No store schema change.
- **Removal:** the results-screen "Run again with revisions" button, the
  `revised` state in the lesson page, and the old
  `revisionGenerators(lesson)` are removed/replaced by chapter/cumulative
  pool builders in `lessons/index.ts`.
- **Implementation:** `renderLesson` gains an options parameter (record id,
  optional start/chooser screen, generator pool override) so the revision
  page reuses the drill UI instead of duplicating it.

## Error handling / edge cases

- Every chapter pool must be non-empty after exclusions (Insert Like a Pro
  still has lessons 05, 07; Power Tools still has 27, 28).
- Generators in a mixed pool must all work on the default `SNIPPETS`
  (guaranteed by the exclusion rule — unchanged from today).
- Old progress entries (`30-capstone`, runs with `revised` on lesson ids)
  load fine; the flag is only read for display and bests.

## Testing

- Existing tests under `tests/` must pass with updated generator lists.
- New unit tests: wrongness metric; chapter/cumulative pool builders
  (non-empty, correct exclusion); `SHORT_SNIPPETS` satisfy `openLine`
  candidate rules for both `o` and `O`.
- Manual verify via the running app: ghost truncation on copy-paste lesson,
  hint button, undo-hint appearing only after a bad edit, revision flow
  end-to-end.
