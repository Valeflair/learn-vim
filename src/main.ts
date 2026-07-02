import "./style.css";
import { parseRoute } from "./ui/router";
import { renderHome } from "./ui/home";
import { renderLesson } from "./ui/lesson";
import { renderSidebar } from "./ui/sidebar";
import { getLesson } from "./lessons/index";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<div class="shell"><aside class="sidebar"></aside><main class="main"></main></div>`;
const sidebar = app.querySelector<HTMLElement>(".sidebar")!;
const main = app.querySelector<HTMLElement>(".main")!;

let cleanup: (() => void) | null = null;

function render(): void {
  cleanup?.();
  cleanup = null;

  const route = parseRoute(location.hash);
  if (route.screen === "lesson") {
    const lesson = getLesson(route.lessonId);
    if (!lesson) {
      location.hash = "#/";
      return;
    }
    renderSidebar(sidebar, lesson.id);
    cleanup = renderLesson(main, lesson);
  } else {
    renderSidebar(sidebar, null);
    renderHome(main);
  }
  main.scrollTop = 0;
}

window.addEventListener("hashchange", render);
render();
