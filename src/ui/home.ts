import { lessons, chapters } from "../lessons/index";
import { lessonRecord, formatTime } from "../progress/store";

export function renderHome(app: HTMLElement): void {
  app.innerHTML = "";

  const done = lessons.filter((l) => lessonRecord(l.id)?.done).length;

  const header = document.createElement("header");
  header.className = "home-header";
  header.innerHTML = `
    <h1>Learn Vim by doing</h1>
    <p class="tagline">Drill-based lessons from <kbd>hjkl</kbd> to macros, with a revision drill at the end of every chapter.
    Every drill perturbs one code snippet with randomized tasks and times the run. Beat your best.</p>
    <p class="home-progress">${done} of ${lessons.length} lessons completed</p>
  `;
  app.appendChild(header);

  for (const chapter of chapters()) {
    const h2 = document.createElement("h2");
    h2.textContent = chapter.name;
    app.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "grid";
    for (const lesson of chapter.lessons) {
      const rec = lessonRecord(lesson.id);
      const card = document.createElement("a");
      card.className = rec?.done ? "card card-done" : "card";
      card.href = `#/lesson/${lesson.id}`;
      const keys = lesson.keys.map((k) => k.keys).join("  ");
      card.innerHTML = `
        <span class="card-title"><span class="card-order">${String(lesson.order).padStart(2, "0")}</span> ${lesson.title}</span>
        <span class="card-keys">${keys}</span>
        <span class="card-best">${rec?.done && rec.bestTimeMs !== null ? `✓ best ${formatTime(rec.bestTimeMs)} · ${rec.bestKeystrokes} keys` : `${lesson.taskCount} tasks`}</span>
      `;
      grid.appendChild(card);
    }
    app.appendChild(grid);
  }
}
