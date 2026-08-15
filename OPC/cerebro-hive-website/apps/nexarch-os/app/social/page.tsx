import { PageHeader } from "@/components/PageHeader";
import { Dot, Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";
import { listEnvConnections } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export default function SocialPage() {
  const db = getDb();
  const accounts = db.social.list();
  const live = listEnvConnections().filter((c) => ["github", "slack"].includes(c.id));
  return (
    <div>
      <PageHeader eyebrow="Growth" title="Social" />
      <p className="mb-6 text-[12px] text-os-muted">
        Cadence is seeded. Follower counts are seed zeros, not live charts.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {accounts.map((a) => (
          <Panel key={a.id}>
            <div className="text-[13px] font-bold uppercase">{a.platform}</div>
            <div className="mt-1 text-[12px] text-os-muted">{a.handle}</div>
            <div className="mt-2 text-[11px] text-os-dim">{a.cadence}</div>
            <div className="mt-2 text-[11px] text-os-warn">followers seed: {a.followersSeed} (not live)</div>
          </Panel>
        ))}
      </div>
      <div className="mt-6 flex gap-3 text-[11px] uppercase tracking-[0.12em]">
        {live.map((c) => (
          <span key={c.id} className="flex items-center gap-2">
            <Dot status={c.status} /> {c.name} {c.status}
          </span>
        ))}
      </div>
    </div>
  );
}
