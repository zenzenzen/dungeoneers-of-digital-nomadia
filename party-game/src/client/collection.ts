export interface Collection {
  schemaVersion: 1;
  cards: string[];
  endings: { id: string; text: string; won: boolean }[];
}
export const emptyCollection = (): Collection => ({
  schemaVersion: 1,
  cards: [],
  endings: [],
});
export function parseCollection(value: unknown): Collection {
  if (!value || typeof value !== "object")
    throw new Error("Choose a Digital Nomadia collection export.");
  const v = value as Collection;
  if (
    v.schemaVersion !== 1 ||
    !Array.isArray(v.cards) ||
    !Array.isArray(v.endings) ||
    v.cards.length > 10000 ||
    v.endings.length > 10000
  )
    throw new Error("Unsupported collection format.");
  if (
    v.cards.some((x) => typeof x !== "string" || x.length > 120) ||
    v.endings.some(
      (x) =>
        !x ||
        typeof x.id !== "string" ||
        x.id.length > 200 ||
        typeof x.text !== "string" ||
        x.text.length > 1000 ||
        typeof x.won !== "boolean",
    )
  )
    throw new Error("Invalid collection data.");
  return {
    schemaVersion: 1,
    cards: [...new Set(v.cards)],
    endings: [...new Map(v.endings.map((x) => [x.id, x])).values()],
  };
}
export function mergeCollection(a: Collection, b: Collection): Collection {
  return parseCollection({
    schemaVersion: 1,
    cards: [...a.cards, ...b.cards],
    endings: [...a.endings, ...b.endings],
  });
}
export function loadCollection(): Collection {
  try {
    return parseCollection(
      JSON.parse(localStorage.getItem("nomadia.collection") ?? "null"),
    );
  } catch {
    return emptyCollection();
  }
}
export function saveCollection(c: Collection) {
  localStorage.setItem("nomadia.collection", JSON.stringify(c));
}
