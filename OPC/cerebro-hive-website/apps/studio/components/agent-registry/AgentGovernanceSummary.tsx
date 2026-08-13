import type { AgentDefinitionV1 } from '@cerebro/agent-registry-contracts';

export function AgentGovernanceSummary({ definition }: { definition?: AgentDefinitionV1 }) {
  if (!definition) return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Publish a definition to create the governed snapshot.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-border bg-muted/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Action boundary</p><h3 className="mt-2 font-semibold">{definition.allowedActions.length} allowed · {definition.prohibitedActions.length} prohibited</h3><div className="mt-4 space-y-2 text-sm text-muted-foreground">{definition.prohibitedActions.map(action => <p key={action.actionRef}><span className="font-mono text-rose-200">{action.actionRef}</span> — {action.description}</p>)}</div></section>
      <section className="rounded-xl border border-border bg-muted/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Security</p><h3 className="mt-2 font-semibold">{definition.securityLevel}</h3><p className="mt-3 text-sm text-muted-foreground">{definition.escalationRules.length} escalation rules · {definition.capabilities.length} declared capabilities</p></section>
      <section className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-cyan-200">Declared tools · metadata only</p><div className="mt-3 space-y-2 text-sm">{definition.toolPermissions.length ? definition.toolPermissions.map(tool => <p key={tool.toolRef}><span className="font-mono">{tool.toolRef}</span> · {tool.operations.join(', ')}</p>) : <p className="text-muted-foreground">No tool declarations.</p>}</div></section>
      <section className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-cyan-200">Knowledge sources · metadata only</p><div className="mt-3 space-y-2 text-sm">{definition.knowledgeSources.length ? definition.knowledgeSources.map(source => <p key={source.knowledgeSourceRef} className="font-mono">{source.knowledgeSourceRef}</p>) : <p className="text-muted-foreground">No knowledge declarations.</p>}</div></section>
    </div>
  );
}
