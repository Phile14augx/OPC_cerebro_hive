import { PageHeader } from "@/components/PageHeader";
import { Badge, Panel } from "@/components/terminal";

export const dynamic = "force-dynamic";

const DAYS = [
  ["1", "Scaffold and chrome", "done"],
  ["2", "Repo layer contract", "done"],
  ["3", "Nexarch seed", "done"],
  ["4", "Operator console", "done"],
  ["5", "Org + Conductor", "done"],
  ["6", "Agent runtime", "done"],
  ["7", "Tasks, skills, broadcast", "done"],
  ["8", "Comms", "done"],
  ["9", "Funnel", "done"],
  ["10", "Content + Social", "done"],
  ["11", "Finances", "done"],
  ["12", "Brain", "done"],
  ["13", "Connections + Hive links", "done"],
  ["14", "Workflows + analytics", "done"],
  ["15", "Harden and handoff", "done"],
];

export default function RoadmapPage() {
  return (
    <div>
      <PageHeader eyebrow="System" title="Roadmap" />
      <Panel>
        <ul className="space-y-2">
          {DAYS.map(([day, title, status]) => (
            <li key={day} className="flex items-center justify-between border-b border-os-border pb-2 text-[12px]">
              <span>
                Day {day} · {title}
              </span>
              <Badge>{status}</Badge>
            </li>
          ))}
        </ul>
      </Panel>
      <p className="mt-6 text-[12px] text-os-muted">
        After day 15: live connectors you actually use, PlatformJob persistence, agent-dispatch.mjs, pgvector brain.
      </p>
    </div>
  );
}
