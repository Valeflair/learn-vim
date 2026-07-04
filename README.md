# learn-vim

A local, free, vim-hero-style interactive Vim tutor. 29 lessons across 9
chapters, from modes and `hjkl` to text objects, marks, and macros. Each
lesson is a drill: 6–12 randomized micro-tasks in an embedded
Vim-emulating editor (CodeMirror + codemirror-vim), timed and scored by
keystrokes — beat your best.

Every drill perturbs a shared code snippet per task: junk to delete is
marked red, missing text shows as a green dashed ghost. Restore the
snippet to solve the task. Gutter uses hybrid line numbers (absolute on
the cursor line, relative elsewhere), mouse clicks are disabled, and
`Ctrl+J`/`Ctrl+K` jump between lessons. Each chapter also has a revision
page: a mixed drill over just that chapter or everything so far.

## Run

    bun install
    bun run build
    bun run preview

Open the printed URL. Progress (best time and keystrokes per lesson) is
saved in your browser's localStorage.

## Develop

    bun run dev       # dev server
    bun run test      # vitest
    bun run build     # typecheck + production build

Lessons live in `src/lessons/`, one file per lesson: intro text, key
reference, and a pool of task generators (`src/lessons/gen.ts`, seeded
RNG for reproducible drills). A generator takes the drill's shared
snippet and either perturbs it (task: restore it) or targets a spot in
it (task: move there or transform it). Snippets must satisfy the
invariants documented in `gen.ts` so every generator finds a candidate.
Add a lesson by creating a file and registering it in
`src/lessons/index.ts`; `tests/lessons.test.ts` validates the format and
fuzzes every generator against every snippet. Chapters are lessons
grouped by `section` (`src/lessons/index.ts`). The drill state machine
is `src/challenge/drill.ts`; revision pages are `src/ui/revision.ts`.

Insert-mode typing, the `/` search panel, and `j`/`k` display motions
can't be driven by synthetic keys in jsdom — those need a real browser
playtest.
