/** Tiny inline renderer: `key` becomes a keycap, **text** becomes bold. */
export function md(text: string): string {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/`([^`]+)`/g, "<kbd>$1</kbd>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
