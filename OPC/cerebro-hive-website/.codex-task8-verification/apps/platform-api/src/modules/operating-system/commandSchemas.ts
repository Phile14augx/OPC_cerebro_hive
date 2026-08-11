import { FormatRegistry, Type, type Static } from "@sinclair/typebox";

if (!FormatRegistry.Has("uuid")) {
  FormatRegistry.Set("uuid", (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export const ServerCommandSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("create-task"),
    title: Type.String({ minLength: 3, maxLength: 240 }),
    targetType: Type.Union([Type.Literal("agent"), Type.Literal("department"), Type.Literal("workflow")]),
    targetId: Type.String({ format: "uuid" }),
    input: Type.Record(Type.String(), Type.Unknown()),
  }),
  Type.Object({
    kind: Type.Literal("execute-agent"),
    targetId: Type.String({ format: "uuid" }),
    input: Type.Record(Type.String(), Type.Unknown()),
  }),
]);

export type ServerCommand = Static<typeof ServerCommandSchema>;

export const CommandRequestSchema = Type.Union([
  ServerCommandSchema,
  Type.Object({ text: Type.String({ minLength: 1, maxLength: 1000 }) }),
]);

/** Deliberately constrained server-owned command grammar for the command bar. */
export function parseServerCommandText(text: string): ServerCommand | null {
  const match = /^execute-agent\s+([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\s+(.+))?$/i.exec(text.trim());
  if (!match) return null;
  return { kind: "execute-agent", targetId: match[1], input: match[2] ? { message: match[2].trim() } : {} };
}
