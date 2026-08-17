import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const load = (relativePath: string): unknown =>
  JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const flattenKeys = (value: unknown, prefix = ""): Set<string> => {
  const keys = new Set<string>();
  if (!value || typeof value !== "object" || Array.isArray(value)) return keys;

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    keys.add(path);
    for (const nested of flattenKeys(child, path)) keys.add(nested);
  }
  return keys;
};

const references = (value: unknown): string[] => {
  if (typeof value === "string") {
    const match = value.match(/^\{(.+)\.value\}$/);
    return match ? [match[1]] : [];
  }
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(references);
};

describe("design token references", () => {
  it("resolves every semantic and component reference to a declared token", () => {
    const documents = [
      load("./core/color.json"),
      load("./core/radius.json"),
      load("./core/spacing.json"),
      load("./core/typography.json"),
      load("./semantic/light.json"),
      load("./semantic/dark.json"),
      load("./component/button.json"),
    ];
    const declared = documents.reduce((keys, document) => {
      for (const key of flattenKeys(document)) keys.add(key);
      return keys;
    }, new Set<string>());

    expect(documents.flatMap(references).filter((ref) => !declared.has(ref))).toEqual([]);
  });
});
