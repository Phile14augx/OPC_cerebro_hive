import { PageHeader } from "@/components/PageHeader";
import { ReplyButton } from "@/components/ReplyButton";
import { Badge, Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";
import { envStatus } from "@/lib/connectors";

export const dynamic = "force-dynamic";

const LANES = ["email", "github", "slack", "notes"] as const;

export default function CommsPage() {
  const db = getDb();
  const threads = db.comms.list();
  const imap = envStatus(["IMAP_HOST", "IMAP_USER", "IMAP_PASSWORD"]);
  const github = envStatus(["GITHUB_TOKEN"]);
  const slack = envStatus(["SLACK_BOT_TOKEN"]);

  return (
    <div>
      <PageHeader eyebrow="Inbox" title="Comms" />
      <div className="mb-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em] text-os-muted">
        <span>imap {imap}</span>
        <span>github {github}</span>
        <span>slack {slack}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {LANES.map((lane) => (
          <Panel key={lane}>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{lane}</div>
            <ul className="space-y-3">
              {threads
                .filter((t) => t.lane === lane)
                .map((t) => (
                  <li key={t.id} className="border-t border-os-border pt-3 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-bold uppercase">{t.subject}</div>
                      <Badge>{t.status}</Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-os-muted">{t.fromName}</p>
                    <p className="mt-1 text-[12px] text-os-dim">{t.preview}</p>
                    {t.status === "open" ? <div className="mt-2"><ReplyButton threadId={t.id} /></div> : null}
                  </li>
                ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
