const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

const SPECIAL: Record<string, string> = {
  Escape: "Esc",
  Enter: "CR",
  Backspace: "BS",
  Tab: "Tab",
  Delete: "Del",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  ArrowDown: "Down",
  Home: "Home",
  End: "End",
  " ": "Space",
};

export function formatKey(e: KeyboardEvent): string | null {
  if (MODIFIERS.has(e.key)) return null;
  const special = SPECIAL[e.key];
  if (e.ctrlKey) return `<C-${special ?? e.key}>`;
  if (special) return `<${special}>`;
  if (e.key.length === 1) return e.key;
  return null;
}
