import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCollection,
  mergeCollection,
  emptyCollection,
} from "../src/client/collection";
test("collection imports are bounded, versioned, and never accept power fields", () => {
  const imported = parseCollection({
    schemaVersion: 1,
    cards: ["trait_test", "trait_test"],
    endings: [],
    level: 999,
    wallet: { cash_cp: 999 },
  });
  assert.deepEqual(imported, {
    schemaVersion: 1,
    cards: ["trait_test"],
    endings: [],
  });
  assert.throws(() =>
    parseCollection({ schemaVersion: 2, cards: [], endings: [] }),
  );
  assert.throws(() =>
    parseCollection({ schemaVersion: 1, cards: [42], endings: [] }),
  );
  assert.deepEqual(mergeCollection(emptyCollection(), imported), imported);
});
