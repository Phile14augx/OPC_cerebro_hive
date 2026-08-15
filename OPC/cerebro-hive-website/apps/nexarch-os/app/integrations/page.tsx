import { PageHeader } from "@/components/PageHeader";
import { Dot, Panel } from "@/components/terminal";
import { hiveDeepLinks, listConnections } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const connections = await listConnections();
  const links = hiveDeepLinks();
  const groups = [...new Set(connections.map((c) => c.group))];

  return (
    <div>
      <PageHeader eyebrow="System" title="Connections" />
      <p className="mb-6 text-[12px] text-os-muted">
        Status from code. Never seeded as connected. Hive deep links stay one hop away.
      </p>
      {groups.map((group) => (
        <div key={group} className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{group}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {connections
              .filter((c) => c.group === group)
              .map((c) => (
                <Panel key={c.id}>
                  <div className="flex items-center gap-2 text-[13px] uppercase">
                    <Dot status={c.status} />
                    {c.name}
                    <span className="text-os-dim">{c.status}</span>
                  </div>
                  <p className="mt-2 text-[12px] text-os-muted">{c.detail}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-2 inline-block text-[11px] uppercase tracking-[0.12em] underline">
                      Open
                    </a>
                  ) : null}
                </Panel>
              ))}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-os-dim">
        Studio {links.studioHome} · Forge {links.forge} · Archive {links.archive} · Runtime {links.runtime}
      </p>
    </div>
  );
}
