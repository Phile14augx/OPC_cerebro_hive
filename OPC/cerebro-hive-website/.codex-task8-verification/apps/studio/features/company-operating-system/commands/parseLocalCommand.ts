export type LocalCommandKind = "focus" | "find" | "open";

export interface LocalCommand {
  kind: LocalCommandKind;
  target: string;
}

const supportedKinds = new Set<LocalCommandKind>(["focus", "find", "open"]);

/** Parses only the deliberately small local command grammar; everything else is server-owned. */
export function parseLocalCommand(text: string): LocalCommand | null {
  const normalized = text.trim().replace(/\s+/g, " ");
  const match = /^(focus|find|open) (.+)$/i.exec(normalized);
  if (!match) return null;

  const kind = match[1].toLowerCase() as LocalCommandKind;
  const target = match[2].trim();
  return supportedKinds.has(kind) && target ? { kind, target } : null;
}
