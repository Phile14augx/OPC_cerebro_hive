'use client';

import { useEffect, useState } from 'react';
import type { AgentDraftDocumentV1, AgentDraftDto } from '@cerebro/agent-registry-contracts';
import { SDKError } from '@cerebro/sdk';
import { useUpdateAgentDraft } from '@/src/hooks/useAgentRegistry';

export function AgentDraftEditor({ agentId, draft }: { agentId: string; draft: AgentDraftDto }) {
  const update = useUpdateAgentDraft(agentId);
  const [text, setText] = useState(() => JSON.stringify(draft.definition, null, 2));
  const [revision, setRevision] = useState(draft.revision);
  const [localError, setLocalError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) return;
    const timer = window.setTimeout(async () => {
      try {
        const definition = JSON.parse(text) as AgentDraftDocumentV1;
        const saved = await update.mutateAsync({ expectedRevision: revision, definition });
        setRevision(saved.revision);
        setIsDirty(false);
        setLocalError(null);
        setConflict(null);
      } catch (error) {
        if (error instanceof SyntaxError) setLocalError('The definition is not valid JSON. Your local text is preserved.');
        else if (error instanceof SDKError && error.code === 'AGENT_DRAFT_REVISION_CONFLICT') {
          setConflict(Number(error.details.currentRevision));
          setLocalError('A newer server revision exists. Your local text has not been discarded.');
        } else setLocalError(error instanceof Error ? error.message : 'Autosave failed.');
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [text, revision, update, isDirty]);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div><h2 className="font-semibold">Working definition</h2><p className="text-xs text-muted-foreground">Autosaves after 900 ms · optimistic revision {revision}</p></div>
          <span className={`font-mono text-xs ${update.isPending || isDirty ? 'text-amber-200' : 'text-emerald-300'}`}>{update.isPending ? 'Saving…' : isDirty ? 'Local changes' : 'Saved'}</span>
        </div>
        <textarea
          aria-label="Agent definition JSON"
          spellCheck={false}
          value={text}
          onChange={event => { setIsDirty(true); setText(event.target.value); }}
          className="min-h-[560px] w-full resize-y rounded-xl border border-border bg-[#080d13] p-5 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:border-cyan-400"
        />
        {localError && <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-200">{localError}{conflict ? ` Server revision: ${conflict}.` : ''}</div>}
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Publication readiness</p>
          <p className="mt-2 font-semibold">{draft.validationStatus}</p>
          {draft.validationErrors?.length ? <ul className="mt-3 space-y-2 text-xs text-rose-200">{draft.validationErrors.map((error, index) => <li key={`${error.path}-${index}`}><span className="font-mono">{error.path || 'definition'}</span>: {error.message}</li>)}</ul> : <p className="mt-2 text-xs leading-5 text-muted-foreground">Publication runs the complete validator. Structural autosave alone does not mean publishable.</p>}
        </div>
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs leading-5 text-cyan-100/80">
          Tool permissions and knowledge sources are descriptive registry metadata in this slice. They do not grant runtime access or configure retrieval.
        </div>
      </aside>
    </section>
  );
}
