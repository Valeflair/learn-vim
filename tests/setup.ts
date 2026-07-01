// Neither Node (without --localstorage-file) nor jsdom 29 provides a working
// localStorage; back the global with an in-memory Storage for tests.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    key: (i: number) => [...data.keys()][i] ?? null,
    removeItem: (k: string) => void data.delete(k),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
  } as Storage;
}

const memoryStorage = createMemoryStorage();
for (const target of [globalThis, window]) {
  Object.defineProperty(target, "localStorage", {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}

// CodeMirror measures layout; jsdom lacks these APIs.
Range.prototype.getClientRects = function () {
  return {
    length: 0,
    item: () => null,
    [Symbol.iterator]: [][Symbol.iterator],
  } as unknown as DOMRectList;
};
Range.prototype.getBoundingClientRect = () =>
  ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
