import type { Connection, ConnectorStatus } from "./schemas";
import { applyLiveProbes, skipLiveProbes } from "./live";
import { databaseUrl, dispatchDryRunEnabled, dispatchScriptPath, hivePlaneStatus, probePostgres, workspaceId } from "./hive";

export function envStatus(keys: string[]): ConnectorStatus {
  const present = keys.every((key) => Boolean(process.env[key] && process.env[key]!.trim().length > 0));
  return present ? "connected" : "not_configured";
}

export function envConnection(
  id: string,
  name: string,
  group: string,
  keys: string[],
  href: string | null = null,
): Connection {
  const status = envStatus(keys);
  return {
    id,
    name,
    group,
    status,
    href,
    detail:
      status === "connected"
        ? "Credentials present in env. Live calls happen only when a route uses them."
        : `Missing ${keys.filter((k) => !process.env[k]?.trim()).join(", ") || keys.join(", ")}. Honest not_configured.`,
  };
}

export const HIVE_LINKS = {
  studio: process.env.STUDIO_URL ?? "http://localhost:3401",
  platformApi: process.env.PLATFORM_API_URL ?? "http://localhost:3406",
  forgeApi: process.env.FORGE_API_URL ?? "http://localhost:4005",
};

export function hiveDeepLinks() {
  const studio = HIVE_LINKS.studio.replace(/\/$/, "");
  return {
    studioHome: `${studio}/app`,
    forge: `${studio}/app/forge/projects`,
    archive: `${studio}/app/archive`,
    runtime: `${studio}/app/runtime`,
    platformHealth: `${HIVE_LINKS.platformApi.replace(/\/$/, "")}/health`,
    forgeHealth: `${HIVE_LINKS.forgeApi.replace(/\/$/, "")}/health`,
  };
}

export async function probeHealth(url: string): Promise<{ status: ConnectorStatus; detail: string }> {
  if (process.env.VITEST === "true") {
    return { status: "not_configured", detail: "Probes skipped under Vitest." };
  }
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(800), cache: "no-store" });
    if (res.ok) return { status: "connected", detail: `${url} returned ${res.status}.` };
    return { status: "error", detail: `${url} returned ${res.status}.` };
  } catch (err) {
    return {
      status: "error",
      detail: `${url} unreachable: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export function listEnvConnections(): Connection[] {
  const links = hiveDeepLinks();
  const plane = hivePlaneStatus();
  const postgresDetail = databaseUrl()
    ? workspaceId()
      ? "DATABASE_URL present. Live INSERT happens on Dispatcher run."
      : "DATABASE_URL present but NEXARCH_WORKSPACE_ID missing. Cannot INSERT PlatformJob."
    : "DATABASE_URL missing. Honest not_configured.";
  return [
    envConnection("llm-openai", "OpenAI", "llm", ["OPENAI_API_KEY"]),
    envConnection("llm-anthropic", "Anthropic", "llm", ["ANTHROPIC_API_KEY"]),
    envConnection("github", "GitHub", "comms", ["GITHUB_TOKEN"], "https://github.com"),
    envConnection("email", "Email / IMAP", "comms", ["IMAP_HOST", "IMAP_USER", "IMAP_PASSWORD"]),
    envConnection("slack", "Slack", "comms", ["SLACK_BOT_TOKEN"]),
    envConnection("stripe", "Stripe", "finance", ["STRIPE_SECRET_KEY"]),
    envConnection("notion", "Notion", "knowledge", ["NOTION_API_KEY"]),
    {
      id: "postgres",
      name: "Prisma / Postgres",
      group: "hive",
      status: plane.postgres === "connected" && plane.workspace === "connected" ? "connected" : "not_configured",
      href: null,
      detail: postgresDetail,
    },
    {
      id: "dispatch",
      name: "agent-dispatch.mjs",
      group: "hive",
      status: plane.dispatchScript === "connected" && dispatchDryRunEnabled() ? "connected" : "not_configured",
      href: null,
      detail: dispatchDryRunEnabled()
        ? `Opt-in dry-run at ${dispatchScriptPath()}.`
        : "Set NEXARCH_DISPATCH_DRY_RUN=1 to spawn scripts/agent-dispatch.mjs --dry-run. Never stamps SUCCEEDED.",
    },
    {
      id: "pgvector",
      name: "pgvector Memory",
      group: "hive",
      status: plane.pgvector === "connected" && plane.openaiEmbed === "connected" ? "connected" : "not_configured",
      href: null,
      detail:
        plane.pgvector === "connected" && plane.openaiEmbed === "connected"
          ? "DATABASE_URL + OPENAI_API_KEY present. Brain will try Embedding <=> search."
          : "Need DATABASE_URL and OPENAI_API_KEY. Grep fallback stays on.",
    },
    {
      id: "studio",
      name: "CerebroStudio",
      group: "hive",
      status: "not_configured",
      detail: `Deep link ${links.studioHome}. Live probe is on /integrations.`,
      href: links.studioHome,
    },
    {
      id: "platform-api",
      name: "platform-api",
      group: "hive",
      status: "not_configured",
      detail: `Health ${links.platformHealth}. Live probe is on /integrations.`,
      href: links.platformHealth,
    },
    {
      id: "forge-api",
      name: "forge-api",
      group: "hive",
      status: "not_configured",
      detail: `Health ${links.forgeHealth}. Live probe is on /integrations.`,
      href: links.forgeHealth,
    },
  ];
}

export async function listConnections(): Promise<Connection[]> {
  const base = listEnvConnections();
  const links = hiveDeepLinks();
  const live = skipLiveProbes() ? base : await applyLiveProbes(base);
  const postgres = skipLiveProbes()
    ? { status: "not_configured" as const, detail: "Probes skipped." }
    : await probePostgres();
  const [studio, platform, forge] = skipLiveProbes()
    ? [
        { status: "not_configured" as const, detail: "Probes skipped." },
        { status: "not_configured" as const, detail: "Probes skipped." },
        { status: "not_configured" as const, detail: "Probes skipped." },
      ]
    : await Promise.all([
        probeHealth(links.studioHome),
        probeHealth(links.platformHealth),
        probeHealth(links.forgeHealth),
      ]);
  return live.map((c) => {
    if (c.id === "postgres") {
      if (postgres.status === "not_configured" && !databaseUrl()) return c;
      return { ...c, status: postgres.status, detail: postgres.detail };
    }
    if (c.id === "studio") return { ...c, status: studio.status, detail: studio.detail, href: links.studioHome };
    if (c.id === "platform-api") return { ...c, status: platform.status, detail: platform.detail, href: links.platformHealth };
    if (c.id === "forge-api") return { ...c, status: forge.status, detail: forge.detail, href: links.forgeHealth };
    return c;
  });
}
