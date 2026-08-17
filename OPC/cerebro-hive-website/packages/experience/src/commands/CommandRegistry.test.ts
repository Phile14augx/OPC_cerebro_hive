import { describe, expect, it, vi } from "vitest";

import { CommandRegistry } from "./CommandRegistry";

describe("CommandRegistry", () => {
  it("notifies subscribers when a command is registered and removed", () => {
    const listener = vi.fn();
    const unsubscribe = CommandRegistry.subscribe(listener);
    const command = {
      id: "test-command",
      title: "Test",
      category: "Tests",
      keywords: [],
      handler: vi.fn(),
    };

    CommandRegistry.register(command);
    expect(CommandRegistry.getCommands()).toContainEqual(command);
    CommandRegistry.unregister(command.id);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
