import { describe, expect, it } from "vitest";

import { parseLocalCommand } from "./parseLocalCommand";

describe("parseLocalCommand", () => {
  it("parses supported commands deterministically", () => {
    expect(parseLocalCommand("focus research")).toEqual({ kind: "focus", target: "research" });
    expect(parseLocalCommand("find quarterly plan")).toEqual({ kind: "find", target: "quarterly plan" });
    expect(parseLocalCommand("open task-1")).toEqual({ kind: "open", target: "task-1" });
  });

  it("does not reinterpret unsupported language as a local action", () => {
    expect(parseLocalCommand("create a task to audit docs")).toBeNull();
    expect(parseLocalCommand("focus")).toBeNull();
    expect(parseLocalCommand("show agents")).toBeNull();
    expect(parseLocalCommand("hide workflows")).toBeNull();
  });
});
