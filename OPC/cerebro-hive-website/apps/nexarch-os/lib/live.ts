import tls from "node:tls";
import type { NexarchDb } from "./db";
import type { CommsThread, Connection, ConnectorStatus } from "./schemas";

export function skipLiveProbes(): boolean {
  return (
    process.env.NEXARCH_SKIP_PROBES === "1" ||
    process.env.VITEST === "true" ||
    Boolean(process.env.NODE_TEST_CONTEXT)
  );
}

type Probe = { status: ConnectorStatus; detail: string };

async function probeJson(
  url: string,
  init: RequestInit,
  okWhen: (res: Response, body: unknown) => boolean,
  label: string,
): Promise<Probe> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(4000), cache: "no-store" });
    let body: unknown = null;
    const text = await res.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (okWhen(res, body)) return { status: "connected", detail: `${label} ${res.status}.` };
    return { status: "error", detail: `${label} returned ${res.status}.` };
  } catch (err) {
    return { status: "error", detail: `${label} failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function probeGithub(token: string): Promise<Probe> {
  return probeJson(
    "https://api.github.com/user",
    { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "nexarch-os" } },
    (res) => res.ok,
    "GitHub /user",
  );
}

export async function probeSlack(token: string): Promise<Probe> {
  return probeJson(
    "https://slack.com/api/auth.test",
    { method: "POST", headers: { authorization: `Bearer ${token}` } },
    (res, body) => res.ok && typeof body === "object" && body !== null && (body as { ok?: boolean }).ok === true,
    "Slack auth.test",
  );
}

export async function probeStripe(key: string): Promise<Probe> {
  const basic = Buffer.from(`${key}:`).toString("base64");
  return probeJson(
    "https://api.stripe.com/v1/balance",
    { headers: { authorization: `Basic ${basic}` } },
    (res) => res.ok,
    "Stripe /v1/balance",
  );
}

export async function probeNotion(key: string): Promise<Probe> {
  return probeJson(
    "https://api.notion.com/v1/users/me",
    { headers: { authorization: `Bearer ${key}`, "Notion-Version": "2022-06-28" } },
    (res) => res.ok,
    "Notion /users/me",
  );
}

export async function probeOpenAI(key: string): Promise<Probe> {
  return probeJson(
    "https://api.openai.com/v1/models",
    { headers: { authorization: `Bearer ${key}` } },
    (res) => res.ok,
    "OpenAI /v1/models",
  );
}

export async function probeAnthropic(key: string): Promise<Probe> {
  return probeJson(
    "https://api.anthropic.com/v1/models",
    { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" } },
    (res) => res.ok,
    "Anthropic /v1/models",
  );
}

export async function probeImap(host: string, user: string, password: string, port = 993): Promise<Probe> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port, timeout: 4000 }, () => {
      let buf = "";
      let tagged = false;
      socket.on("data", (chunk) => {
        buf += chunk.toString("utf8");
        if (!tagged && /\n\* OK/i.test(buf)) {
          tagged = true;
          const u = user.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
          const p = password.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
          socket.write(`a1 LOGIN "${u}" "${p}"\r\n`);
        }
        if (/^a1 OK/im.test(buf)) {
          socket.write("a2 LOGOUT\r\n");
          resolve({ status: "connected", detail: `IMAP LOGIN succeeded on ${host}:${port}.` });
          socket.end();
        } else if (/^a1 NO|^a1 BAD/im.test(buf)) {
          resolve({ status: "error", detail: `IMAP LOGIN rejected on ${host}:${port}.` });
          socket.end();
        }
      });
    });
    socket.on("error", (err) => resolve({ status: "error", detail: `IMAP ${host}: ${err.message}` }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ status: "error", detail: `IMAP ${host}:${port} timed out.` });
    });
  });
}

export type GithubNotification = {
  id: string;
  reason: string;
  updated_at: string;
  subject?: { title?: string; type?: string };
  repository?: { full_name?: string };
};

export function mapGithubNotifications(items: GithubNotification[]): CommsThread[] {
  return items.map((item) => ({
    id: `gh-${item.id}`,
    lane: "github" as const,
    fromName: item.repository?.full_name ?? "github",
    subject: item.subject?.title ?? item.reason,
    preview: `${item.subject?.type ?? "notification"} · ${item.reason}`,
    status: "open" as const,
    createdAt: item.updated_at,
  }));
}

export async function fetchGithubNotifications(token: string): Promise<
  { status: "connected"; threads: CommsThread[] } | { status: Exclude<ConnectorStatus, "connected">; detail: string }
> {
  try {
    const res = await fetch("https://api.github.com/notifications?per_page=10&all=false", {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "user-agent": "nexarch-os",
      },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return { status: "error", detail: `GitHub notifications ${res.status}.` };
    const items = (await res.json()) as GithubNotification[];
    return { status: "connected", threads: mapGithubNotifications(Array.isArray(items) ? items : []) };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}

export async function ingestLiveComms(db: NexarchDb): Promise<{ github: number; detail: string }> {
  if (skipLiveProbes()) return { github: 0, detail: "Live ingest skipped under test probes." };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return { github: 0, detail: "GITHUB_TOKEN not_configured. Inbox stays on seed threads." };
  const live = await fetchGithubNotifications(token);
  if (live.status !== "connected") return { github: 0, detail: live.detail };
  for (const thread of live.threads) db.comms.upsert(thread);
  return { github: live.threads.length, detail: `Upserted ${live.threads.length} GitHub notifications.` };
}

export async function probeKeyedConnector(id: string): Promise<Probe | null> {
  if (skipLiveProbes()) return null;
  if (id === "github" && process.env.GITHUB_TOKEN?.trim()) return probeGithub(process.env.GITHUB_TOKEN.trim());
  if (id === "slack" && process.env.SLACK_BOT_TOKEN?.trim()) return probeSlack(process.env.SLACK_BOT_TOKEN.trim());
  if (id === "stripe" && process.env.STRIPE_SECRET_KEY?.trim()) return probeStripe(process.env.STRIPE_SECRET_KEY.trim());
  if (id === "notion" && process.env.NOTION_API_KEY?.trim()) return probeNotion(process.env.NOTION_API_KEY.trim());
  if (id === "llm-openai" && process.env.OPENAI_API_KEY?.trim()) return probeOpenAI(process.env.OPENAI_API_KEY.trim());
  if (id === "llm-anthropic" && process.env.ANTHROPIC_API_KEY?.trim()) {
    return probeAnthropic(process.env.ANTHROPIC_API_KEY.trim());
  }
  if (id === "email" && process.env.IMAP_HOST?.trim() && process.env.IMAP_USER?.trim() && process.env.IMAP_PASSWORD?.trim()) {
    return probeImap(process.env.IMAP_HOST.trim(), process.env.IMAP_USER.trim(), process.env.IMAP_PASSWORD.trim());
  }
  return null;
}

export async function applyLiveProbes(base: Connection[]): Promise<Connection[]> {
  const probed = await Promise.all(
    base.map(async (c) => {
      const live = await probeKeyedConnector(c.id);
      if (!live) return c;
      return { ...c, status: live.status, detail: live.detail };
    }),
  );
  return probed;
}
