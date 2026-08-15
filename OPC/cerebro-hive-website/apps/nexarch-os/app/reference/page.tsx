import { PageHeader } from "@/components/PageHeader";
import { Panel, SectionHead } from "@/components/terminal";

export const dynamic = "force-dynamic";

export default function ReferencePage() {
  return (
    <div>
      <PageHeader eyebrow="System" title="Reference model" />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <SectionHead>Repo layer</SectionHead>
          <p className="mt-3 text-[12px] text-os-muted">
            Pages and API routes read through lib/db.ts. Zod validates every row on the way out. Seed lives in lib/seed.ts.
            Swapping SQLite for Prisma Agent / PlatformJob is a repo-level change.
          </p>
        </Panel>
        <Panel>
          <SectionHead>Honest connectors</SectionHead>
          <p className="mt-3 text-[12px] text-os-muted">
            connected | not_configured | error. Never a fake green light. SUCCEEDED is forbidden unless a worker recorded it.
          </p>
        </Panel>
        <Panel>
          <SectionHead>Company of agents</SectionHead>
          <p className="mt-3 text-[12px] text-os-muted">
            Operator Philemon → Conductor Nexarch → Forge, Swarm, Growth, Archive, HiveOps, Comms, Finance. Each agent has run().
          </p>
        </Panel>
        <Panel>
          <SectionHead>Brain</SectionHead>
          <p className="mt-3 text-[12px] text-os-muted">
            Markdown under Hive docs/ is the library. Claims are not facts until you promote them.
          </p>
        </Panel>
      </div>
    </div>
  );
}
