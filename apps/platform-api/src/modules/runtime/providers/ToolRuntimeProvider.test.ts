import type { ToolRegistry, ToolRuntime } from "@cerebro/agent-builder-capability";
import { describe, expect, it, vi } from "vitest";
import { ToolRuntimeToolProvider } from "./ToolRuntimeProvider";

describe("ToolRuntimeToolProvider", () => {
  it("delegates invokeTool to ToolRuntime.executeTool with the same arguments", async () => {
    const executeTool = vi.fn().mockResolvedValue({ result: 42 });
    const toolRuntime = { executeTool } as unknown as ToolRuntime;
    const toolRegistry = {} as ToolRegistry;
    const provider = new ToolRuntimeToolProvider(toolRuntime, toolRegistry);
    const context = { workspaceId: "ws-1" } as any;

    const result = await provider.invokeTool("calculator", { expression: "2+2" }, context);

    expect(result).toEqual({ result: 42 });
    expect(executeTool).toHaveBeenCalledWith("calculator", { expression: "2+2" }, context);
  });

  it("propagates errors from ToolRuntime.executeTool", async () => {
    const executeTool = vi.fn().mockRejectedValue(new Error("tool not found"));
    const toolRuntime = { executeTool } as unknown as ToolRuntime;
    const provider = new ToolRuntimeToolProvider(toolRuntime, {} as ToolRegistry);

    await expect(provider.invokeTool("missing", {}, {} as any)).rejects.toThrow("tool not found");
  });

  it("lists tool names from ToolRegistry.listNames()", async () => {
    const listNames = vi.fn().mockReturnValue(["calculator", "search"]);
    const toolRegistry = { listNames } as unknown as ToolRegistry;
    const provider = new ToolRuntimeToolProvider({} as ToolRuntime, toolRegistry);

    const names = await provider.listAvailableTools({} as any);

    expect(names).toEqual(["calculator", "search"]);
  });
});
