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
