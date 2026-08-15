import type { NexarchDb } from "../db";
import { searchBrain } from "../brain";
import { computePulse } from "../pulse";
import { listEnvConnections } from "../connectors";
import type { RuntimeAgent } from "./runtime";
import {
  dispatchDryRunEnabled,
  enqueuePlatformJob,
  hivePlaneStatus,
  runDispatchDryRun,
  summarizeJobs,
} from "../hive";
import { ingestLiveComms } from "../live";

function ok(summary: string, data?: unknown) {
  return { ok: true as const, summary, data };
}

function refuse(summary: string) {
  return { ok: false as const, summary };
}

export function createNexarchAgents(db: NexarchDb): RuntimeAgent[] {
  const agents: RuntimeAgent[] = [
    {
      id: "nexarch",
      name: "Nexarch",
      description: "Conductor",
      departmentId: "conductor",
      async run() {
        const pulse = computePulse(db);
        db.pulse.upsert({
          id: `pulse-${Date.now()}`,
          capturedAt: new Date().toISOString(),
          ...pulse,
        });
        return ok(
          `Pulse: ${pulse.agentsActive} agents active, ${pulse.openComms} open comms, ${pulse.openTasks} open tasks, runway ${pulse.runwayMonths.toFixed(1)} months.`,
          pulse,
        );
      },
      async respond(message) {
        return ok(`Conductor received: "${message.slice(0, 120)}". Routing to the company.`);
      },
    },
    {
      id: "forge-lead",
      name: "Forge Lead",
      description: "Pillar",
      departmentId: "forge",
      async run() {
        return ok(
          "CerebroForge 9 tools are FUNCTIONAL_BETA. Auto-fix disabled. Architecture editor PLACEHOLDER. Deep link Studio /app/forge/projects.",
        );
      },
    },
    {
      id: "architect",
      name: "Architect",
      description: "Specialist",
      departmentId: "forge",
      async run() {
        const text = "Control plane must not mix every language into Studio. Jobs belong on the execution plane.";
        db.claims.upsert({
          id: `cl-${Date.now()}`,
          sourceId: "k-platform",
          text,
          status: "claim",
          createdBy: "architect",
          createdAt: new Date().toISOString(),
        });
        return ok(`Wrote pending claim (not a fact): ${text}`);
      },
    },
    {
      id: "codegen",
      name: "Codegen",
      description: "Worker",
      departmentId: "forge",
      async run() {
        return refuse("Forge codegen SSE not invoked from Nexarch OS. Worker not wired. generator.supported remains false.");
      },
    },
    {
      id: "reviewer",
      name: "Reviewer",
      description: "Worker",
      departmentId: "forge",
      async run() {
        const last = db.agentRuns.list().slice(0, 5);
        const failed = last.filter((r) => !r.ok);
        return ok(`Reviewed ${last.length} recent runs. ${failed.length} honest failures. No fabricated success.`);
      },
    },
    {
      id: "swarm-lead",
      name: "Swarm Lead",
      description: "Pillar",
      departmentId: "swarm",
      async run() {
        const byDept = new Map<string, number>();
        for (const a of db.agents.list()) {
          byDept.set(a.departmentId, (byDept.get(a.departmentId) ?? 0) + 1);
        }
        const summary = [...byDept.entries()].map(([k, v]) => `${k}:${v}`).join(" ");
        return ok(`Workforce roster ${db.agents.list().length} agents. ${summary}`);
      },
    },
    {
      id: "dispatcher",
      name: "Dispatcher",
      description: "Worker",
      departmentId: "swarm",
      async run() {
        const plane = hivePlaneStatus();
        const canPostgres = plane.postgres === "connected" && plane.workspace === "connected";
        const canDispatch = plane.dispatchScript === "connected" && dispatchDryRunEnabled();
        if (!canPostgres && !canDispatch) {
          return refuse(
            "Hive control plane not_configured (need DATABASE_URL+NEXARCH_WORKSPACE_ID and/or NEXARCH_DISPATCH_DRY_RUN=1). Will not stamp SUCCEEDED.",
          );
        }
        const { job, prisma } = await enqueuePlatformJob(db, {
          type: "nexarch.dispatcher",
          metadata: { source: "nexarch-os", agentId: "dispatcher" },
        });
        let dispatchSummary = "dispatch skipped";
        if (canDispatch) {
          const dry = await runDispatchDryRun();
          dispatchSummary = dry.summary;
        }
        const prismaSummary = prisma.ok
          ? `PlatformJob ${prisma.data.prismaId} inserted QUEUED`
          : `Prisma ${prisma.status}: ${prisma.detail}`;
        const summary = `Local job ${job.id} status=${job.status}. ${prismaSummary}. ${dispatchSummary}`;
        if (job.status === "SUCCEEDED") {
          return refuse("Refusing to report SUCCEEDED; dispatcher never stamps that state.");
        }
        return ok(summary, { job, prisma: prisma.ok ? prisma.data : prisma });
      },
    },
    {
      id: "growth-lead",
      name: "Growth Lead",
      description: "Pillar",
      departmentId: "growth",
      async run() {
        const deals = db.funnel.list();
        const byStage = deals.reduce<Record<string, number>>((acc, d) => {
          acc[d.stage] = (acc[d.stage] ?? 0) + 1;
          return acc;
        }, {});
        return ok(`Pipeline ${deals.length} accounts. ${JSON.stringify(byStage)}`);
      },
    },
    {
      id: "funnel",
      name: "Funnel",
      description: "Worker",
      departmentId: "growth",
      async run() {
        const next = db.funnel.list().map((d) => `${d.name} @ ${d.stage}: ${d.nextStep}`);
        return ok(next.join(" | ") || "No deals.");
      },
    },
    {
      id: "content",
      name: "Content",
      description: "Worker",
      departmentId: "growth",
      async run() {
        const upcoming = db.content.list().filter((c) => c.status !== "published")[0];
        return upcoming
          ? ok(`Next: ${upcoming.title} (${upcoming.channel}, ${upcoming.status}) on ${upcoming.scheduledFor}.`)
          : ok("Content calendar empty.");
      },
    },
    {
      id: "social",
      name: "Social",
      description: "Worker",
      departmentId: "growth",
      async run() {
        const accounts = db.social.list();
        const live = listEnvConnections().filter((c) => c.group === "comms");
        return ok(
          `${accounts.length} seeded accounts. Live social connectors: ${live.map((c) => `${c.id}=${c.status}`).join(", ")}. Follower counts are seed, not live.`,
        );
      },
    },
    {
      id: "archive-lead",
      name: "Archive Lead",
      description: "Pillar",
      departmentId: "archive",
      async run() {
        return ok(`${db.knowledge.nodes().length} knowledge nodes, ${db.claims.list().length} claims in the truth lifecycle.`);
      },
    },
    {
      id: "librarian",
      name: "Librarian",
      description: "Worker",
      departmentId: "archive",
      async run() {
        const hits = await searchBrain("execution plane");
        const paths = hits.hits.slice(0, 3).map((h) => h.path).join(", ");
        return ok(
          hits.hits.length
            ? `${hits.provider} search "execution plane": ${paths}`
            : `${hits.provider}: ${hits.detail}`,
        );
      },
      async respond(message) {
        const hits = await searchBrain(message);
        return ok(
          hits.hits.length
            ? hits.hits.slice(0, 5).map((h) => `${h.path}: ${h.snippet}`).join(" | ")
            : hits.detail,
        );
      },
    },
    {
      id: "memory-governor",
      name: "Memory Governor",
      description: "Worker",
      departmentId: "archive",
      async run() {
        const pending = db.claims.list().filter((c) => c.status === "claim" || c.status === "signal");
        return ok(`${pending.length} claims awaiting operator promotion. Facts are promotion-gated.`);
      },
    },
    {
      id: "hiveops-lead",
      name: "HiveOps Lead",
      description: "Pillar",
      departmentId: "hiveops",
      async run() {
        const jobs = db.hiveJobs.list();
        const succeeded = jobs.filter((j) => j.status === "SUCCEEDED");
        const summary = summarizeJobs(jobs);
        if (succeeded.length > 0) {
          return ok(summary);
        }
        if (jobs.length === 0) {
          return refuse(`${summary} Execution-plane worker not claimed. Will not display SUCCEEDED.`);
        }
        return ok(`${summary} Queued or failed only — worker has not recorded SUCCEEDED.`);
      },
    },
    {
      id: "comms-lead",
      name: "Comms Lead",
      description: "Pillar",
      departmentId: "comms",
      async run() {
        const open = db.comms.list().filter((c) => c.status === "open");
        return ok(`${open.length} open threads. Lanes: ${[...new Set(open.map((c) => c.lane))].join(", ")}.`);
      },
    },
    {
      id: "inbox",
      name: "Inbox",
      description: "Worker",
      departmentId: "comms",
      async run() {
        const live = await ingestLiveComms(db);
        const open = db.comms.list().filter((c) => c.status === "open");
        const lines = open.map((t) => `[${t.lane}] ${t.fromName}: ${t.subject}`);
        return ok(`${live.detail} ${lines.join(" / ") || "Inbox clear."}`);
      },
      async respond(message) {
        return ok(`Inbox would draft a reply. Live send is not_configured unless IMAP env is set. Note: ${message.slice(0, 80)}`);
      },
    },
    {
      id: "finance-lead",
      name: "Finance Lead",
      description: "Pillar",
      departmentId: "finance",
      async run() {
        const pulse = computePulse(db);
        const stripe = listEnvConnections().find((c) => c.id === "stripe");
        return ok(
          `Runway ${pulse.runwayMonths.toFixed(1)} months from ledger. Stripe ${stripe?.status ?? "not_configured"}.`,
        );
      },
    },
  ];

  return agents;
}
