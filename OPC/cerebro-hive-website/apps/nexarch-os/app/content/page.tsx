import { PageHeader } from "@/components/PageHeader";
import { Badge, Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function ContentPage() {
  const db = getDb();
  const items = db.content.list();
  return (
    <div>
      <PageHeader eyebrow="Growth" title="Content" />
      <Panel>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-os-border pb-3 last:border-0">
              <div>
                <div className="text-[13px] uppercase">{item.title}</div>
                <div className="text-[11px] text-os-dim">{item.channel} · {item.scheduledFor}</div>
              </div>
              <Badge>{item.status}</Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
