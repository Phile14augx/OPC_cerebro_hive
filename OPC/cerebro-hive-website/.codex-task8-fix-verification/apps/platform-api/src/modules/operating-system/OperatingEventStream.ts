import { createHmac, timingSafeEqual } from "node:crypto";

export interface OperatingStreamEvent { id: string; event: "execution" | "activity"; workspaceId: string; occurredAt: string; data: Record<string, unknown>; source: "execution" | "activity"; }
interface Cursor { source: OperatingStreamEvent["source"]; timestamp: string; sourceId: string; workspaceId: string; }

export class OperatingEventStream {
  private readonly events: OperatingStreamEvent[] = [];
  private readonly subscribers = new Map<string, Set<(event: OperatingStreamEvent) => void>>();
  private readonly secret: string;

  constructor(secret = process.env.CEREBRO_OPERATING_EVENT_CURSOR_SECRET) {
    if (!secret && process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") throw new Error("CEREBRO_OPERATING_EVENT_CURSOR_SECRET must be configured outside development and tests");
    this.secret = secret ?? "development-only-operating-event-cursor-secret";
  }

  publish(event: OperatingStreamEvent) { this.events.push(event); if (this.events.length > 500) this.events.shift(); for (const subscriber of this.subscribers.get(event.workspaceId) ?? []) subscriber(event); }
  subscribe(workspaceId: string, subscriber: (event: OperatingStreamEvent) => void) { const subscribers = this.subscribers.get(workspaceId) ?? new Set(); subscribers.add(subscriber); this.subscribers.set(workspaceId, subscribers); return () => { subscribers.delete(subscriber); if (subscribers.size === 0) this.subscribers.delete(workspaceId); }; }
  subscribeWithReplay(workspaceId: string, cursor: string | undefined, subscriber: (event: OperatingStreamEvent) => void) {
    const unsubscribe = this.subscribe(workspaceId, subscriber);
    for (const event of this.eventsAfter(workspaceId, cursor)) subscriber(event);
    return unsubscribe;
  }
  cursorFor(event: OperatingStreamEvent) { return this.sign({ source: event.source, timestamp: event.occurredAt, sourceId: event.id, workspaceId: event.workspaceId }); }
  isValidCursor(cursor: string, workspaceId?: string) { const parsed = this.verify(cursor); return parsed !== null && (!workspaceId || parsed.workspaceId === workspaceId); }
  eventsAfter(workspaceId: string, cursor?: string): OperatingStreamEvent[] {
    const parsed = cursor ? this.verify(cursor) : null;
    if (cursor && (!parsed || parsed.workspaceId !== workspaceId)) return [];
    return this.events.filter((event) => event.workspaceId === workspaceId && (!parsed || `${event.occurredAt}:${event.id}` > `${parsed.timestamp}:${parsed.sourceId}`));
  }
  private sign(value: Cursor) { const payload = Buffer.from(JSON.stringify(value)).toString("base64url"); return `${payload}.${createHmac("sha256", this.secret).update(payload).digest("base64url")}`; }
  private verify(value: string): Cursor | null { const [payload, signature] = value.split("."); if (!payload || !signature) return null; const expected = createHmac("sha256", this.secret).update(payload).digest("base64url"); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return typeof parsed.source === "string" && typeof parsed.timestamp === "string" && typeof parsed.sourceId === "string" && typeof parsed.workspaceId === "string" ? parsed as Cursor : null; } catch { return null; } }
}
