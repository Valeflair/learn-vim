# learn-vim

A local, free, vim-hero-style interactive Vim tutor. 30 lessons from modes
and `hjkl` to text objects, marks, and macros. Each lesson is a **drill**:
6–12 randomized micro-tasks solved in an embedded Vim-emulating editor
(CodeMirror + codemirror-vim), measured by elapsed time and total
keystrokes — beat your best.

Every drill picks one shared code snippet and perturbs it per task:
junk to delete is marked red, missing text appears as a green dashed
ghost — restore the snippet to its pristine form. The gutter shows
hybrid line numbers (absolute on the cursor line, relative elsewhere),
mouse clicks in the editor are disabled (keyboard only), and
`Ctrl+J` / `Ctrl+K` jump to the next / previous lesson.

## Run

    npm install
    npm run dev

Open the printed URL. Progress (best time and keystrokes per lesson) is
saved in your browser's localStorage.

## Develop

    npm test          # vitest
    npm run build     # typecheck + production build

Lessons live in `src/lessons/` — one data file per lesson holding intro
paragraphs, a key reference, and a pool of task **generators** drawn from
`src/lessons/gen.ts` (seeded RNG, so drills are reproducible). A generator
receives the drill's shared base snippet and either perturbs it (task =
restore the pristine snippet) or targets a spot in it (task = move there
or transform it). Snippets in `SNIPPETS` must satisfy the invariants
documented in `gen.ts` (word counts, quote/bracket pairs, blank-line
placement) so every generator always finds a candidate. Add a lesson by
creating a file and registering it in `src/lessons/index.ts`;
`tests/lessons.test.ts` validates the format and fuzzes every generator
against every snippet across many seeds. The drill state machine is
`src/challenge/drill.ts`.

Note: insert-mode typing, the `/` search panel, and `j`/`k` display motions
can't be driven by synthetic keys in jsdom — those paths need a real
browser playtest.
