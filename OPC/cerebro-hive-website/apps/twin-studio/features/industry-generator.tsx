'use client';

import { FormEvent, useState } from 'react';

type JsonObject = Record<string, unknown>;
type GeneratedProposal = {
  industry: string;
  title: string;
  definition: JsonObject;
  previewOnly: true;
  schemaValid: true;
  policyValid: true;
};

const GENERATE_API = '/app/api/industry-models/generate';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const payload = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }
  return payload?.data as T;
}

export function IndustryGenerator({
  disabled,
  onGenerated,
}: {
  disabled?: boolean;
  onGenerated: (proposal: GeneratedProposal) => void;
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<GeneratedProposal | null>(null);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setWorking(true);
    setError('');
    try {
      const proposal = await request<GeneratedProposal>(GENERATE_API, {
        method: 'POST',
        body: JSON.stringify({
          brief: String(form.get('brief') ?? ''),
          industry: String(form.get('industry') ?? '') || undefined,
          name: String(form.get('name') ?? '') || undefined,
        }),
      });
      setPreview(proposal);
      onGenerated(proposal);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Generation failed.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="generator">
      <h3>Industry generator</h3>
      <p>
        Generates a validated preview only. Nothing is persisted until you create a twin or approve a
        version proposal.
      </p>
      <form onSubmit={generate}>
        <label htmlFor="industry-brief">Domain brief</label>
        <textarea
          id="industry-brief"
          name="brief"
          required
          minLength={8}
          maxLength={2000}
          placeholder="Airport gate B12 aircraft turnaround, or a retail bank branch with ATMs."
        />
        <label htmlFor="industry-key">Industry hint</label>
        <select id="industry-key" name="industry" defaultValue="">
          <option value="">Infer from brief</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="airport">Airport</option>
          <option value="hospital">Hospital</option>
          <option value="banking">Banking</option>
          <option value="supply-chain">Supply chain</option>
          <option value="building">Building</option>
          <option value="energy-grid">Energy grid</option>
          <option value="data-center">Data center</option>
          <option value="generic">Generic</option>
        </select>
        <label htmlFor="industry-name">Suggested name</label>
        <input id="industry-name" name="name" maxLength={160} />
        <button className="primary" disabled={disabled || working}>
          {working ? 'Generating…' : 'Generate preview'}
        </button>
      </form>
      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}
      {preview && (
        <div className="previewCallout">
          <strong>
            Preview · {preview.industry} · schema valid · policy valid · not persisted
          </strong>
          <pre className="jsonView">{JSON.stringify(preview.definition, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
