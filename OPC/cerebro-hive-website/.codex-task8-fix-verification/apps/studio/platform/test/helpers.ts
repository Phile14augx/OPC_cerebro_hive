import { buildPlatform, type Platform } from "../src/app/container.js";
import type { RequestContext } from "../src/kernel/context/context.js";

export async function testPlatform(): Promise<{ platform: Platform; ctx: RequestContext }> {
  const platform = await buildPlatform({ withDatabase: false, startScheduler: false, config: { EVENT_BUS: "memory", LOG_LEVEL: "error" } as never });
  const boot = await platform.identity.bootstrapOrganization({ name: "Test Org", slug: `t-${Math.random().toString(36).slice(2, 8)}`, ownerEmail: "test@cerebropchive.org", ownerName: "Tester" });
  const principal = await platform.identity.authenticate(boot.apiKey.secret);
  return { platform, ctx: { principal, requestId: "test", traceId: "test-trace" } };
}
