import type { AgentVersionDto } from '@cerebro/agent-registry-contracts';

export function AgentVersionHistory({ versions, activeVersionId }: { versions: AgentVersionDto[]; activeVersionId: string | null }) {
  if (!versions.length) return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No immutable versions yet. Complete the draft and publish version 1.</div>;
  return (
    <div className="space-y-3">
      {versions.map(version => (
        <details key={version.id} className="group rounded-xl border border-border bg-muted/5 open:bg-muted/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
            <div><span className="font-semibold">Version {version.version}</span>{activeVersionId === version.id && <span className="ml-3 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Active</span>}<p className="mt-1 font-mono text-[10px] text-muted-foreground">{version.definitionHash}</p></div>
            <div className="text-right text-xs text-muted-foreground"><p>{new Date(version.publishedAt).toLocaleString()}</p><p className="mt-1">{version.publishedBy || 'system'}</p></div>
          </summary>
          <pre className="max-h-[520px] overflow-auto border-t border-border bg-[#080d13] p-5 text-xs leading-5 text-slate-300">{JSON.stringify(version.definition, null, 2)}</pre>
        </details>
      ))}
    </div>
  );
}
