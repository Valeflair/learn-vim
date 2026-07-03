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
