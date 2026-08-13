'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAgent } from '@/src/hooks/useAgentRegistry';

export function CreateAgentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const create = useCreateAgent();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const agent = await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    onOpenChange(false);
    router.push(`/app/agents/${agent.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => onOpenChange(false)}>
      <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl" aria-label="Create agent draft">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">New registry identity</p>
        <h2 className="mt-2 text-2xl font-semibold">Create an agent draft</h2>
        <p className="mt-2 text-sm text-muted-foreground">This creates a stable agent identity and one mutable draft. Nothing is executable until it is published and promoted.</p>
        <label className="mt-6 block text-sm font-medium">Name<input autoFocus required maxLength={200} value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-muted/10 px-3 py-2.5 outline-none focus:border-cyan-400" /></label>
        <label className="mt-4 block text-sm font-medium">Description<textarea maxLength={5000} rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-2 w-full resize-none rounded-lg border border-border bg-muted/10 px-3 py-2.5 outline-none focus:border-cyan-400" /></label>
        {create.error && <p className="mt-4 text-sm text-rose-300">{create.error.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          <button disabled={!name.trim() || create.isPending} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{create.isPending ? 'Creating…' : 'Create draft'}</button>
        </div>
      </form>
    </div>
  );
}
