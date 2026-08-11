import { type EventBus, type EventEnvelope, type EventHandler, type Subscription, makeEnvelope, subjectMatches } from "./events.js";

/** Synchronous-delivery in-process bus (tests + single-node fallback). */
export class InMemoryEventBus implements EventBus {
  readonly kind = "memory" as const;
  readonly published: EventEnvelope[] = [];
  private subs: { pattern: string; handler: EventHandler }[] = [];

  async publish(subject: string, data: Record<string, unknown>, opts: { organizationId: string; actor?: string; traceId?: string }): Promise<EventEnvelope> {
    const env = makeEnvelope(subject, data, opts);
    this.published.push(env);
    if (this.published.length > 10000) this.published.splice(0, 1000);
    for (const sub of [...this.subs]) {
      if (subjectMatches(sub.pattern, subject)) {
        try { await sub.handler(env); } catch { /* subscriber errors don't break publishers */ }
      }
    }
    return env;
  }

  async subscribe(pattern: string, handler: EventHandler): Promise<Subscription> {
    const entry = { pattern, handler };
    this.subs.push(entry);
    return { unsubscribe: async () => { this.subs = this.subs.filter(s => s !== entry); } };
  }

  bySubject(prefix: string): EventEnvelope[] { return this.published.filter(e => e.subject.startsWith(prefix)); }
  async close(): Promise<void> { this.subs = []; }
}
