import { PageHeader } from "@/components/PageHeader";
import { RunButton } from "@/components/RunButton";
import { Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function SkillsPage() {
  const db = getDb();
  const skills = db.skills.list();
  return (
    <div>
      <PageHeader eyebrow="Workforce" title="Skills" />
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((s) => (
          <Panel key={s.id}>
            <div className="text-[13px] font-bold uppercase tracking-[0.08em]">{s.name}</div>
            <p className="mt-2 text-[12px] text-os-muted">{s.description}</p>
            <div className="mt-3">
              <RunButton agentId={s.agentId} label={`Run ${s.slug}`} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
