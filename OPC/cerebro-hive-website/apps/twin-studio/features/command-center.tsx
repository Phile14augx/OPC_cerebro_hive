'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { IndustryGenerator } from './industry-generator';

type JsonObject = Record<string, unknown>;
type CurrentState = {
  state: JsonObject;
  provenance: JsonObject;
  source: string;
  classification: string;
  observedAt: string;
  effectiveAt: string;
  ingestedAt: string;
};
type Entity = {
  id: string;
  key: string;
  name: string;
  typeKey: string;
  attributes: JsonObject;
  currentState: CurrentState | null;
};
type Version = {
  id: string;
  versionNumber: number;
  status: string;
  definition: JsonObject;
  createdAt: string;
};
type Twin = {
  id: string;
  name: string;
  type: string;
  status: string;
  metadata: JsonObject;
  activeVersionId: string | null;
  activeVersion: Version | null;
  versions: Version[];
  entities: Entity[];
  updatedAt: string;
};
type Proposal = {
  id: string;
  status: string;
  definition: JsonObject;
  schemaValid: boolean;
  policyValid: boolean;
  createdAt: string;
};
type ScenarioRun = { id: string; status: string; result: JsonObject | null; completedAt: string };
type Scenario = {
  id: string;
  name: string;
  kind: string;
  inputs: JsonObject;
  runs: ScenarioRun[];
};
type TwinEvent = {
  id: string;
  ruleKey: string;
  status: string;
  message: string;
  kind: string;
  source: string;
  classification: string;
  openedAt: string;
  clearedAt: string | null;
  state: JsonObject;
  entity: { id: string; key: string; name: string; typeKey: string };
};
type TwinGraph = {
  nodes: Array<{ id: string; key: string; name: string; typeKey: string }>;
  edges: Array<{
    id: string;
    type: string;
    fromEntityId: string;
    toEntityId: string;
    fromKey: string;
    toKey: string;
    viaAttribute: string;
  }>;
};

const API = '/app/api/twins';
const tabs = ['Overview', 'Live state', 'Graph', 'Events', 'History', 'Versions', 'Scenarios', 'Ask twin', 'Generate'] as const;
type Tab = (typeof tabs)[number];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const payload = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    const code = typeof payload?.error?.code === 'string' ? payload.error.code : '';
    const message = payload?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(code ? `${code}: ${message}` : message);
  }
  return payload?.data as T;
}

function JsonView({ value }: { value: unknown }) {
  return <pre className="jsonView">{JSON.stringify(value, null, 2)}</pre>;
}

export function CommandCenter() {
  const [twins, setTwins] = useState<Twin[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState<Tab>('Overview');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [history, setHistory] = useState<CurrentState[]>([]);
  const [historyEntityId, setHistoryEntityId] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [approvedProposalId, setApprovedProposalId] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [events, setEvents] = useState<TwinEvent[]>([]);
  const [graph, setGraph] = useState<TwinGraph | null>(null);
  const [askAnswer, setAskAnswer] = useState<JsonObject | null>(null);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState('');
  const [generated, setGenerated] = useState<{
    title: string;
    industry: string;
    definition: JsonObject;
  } | null>(null);

  const selected = useMemo(
    () => twins.find((twin) => twin.id === selectedId) ?? twins[0],
    [selectedId, twins],
  );
  const visibleTwins = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return twins;
    return twins.filter(
      (twin) =>
        twin.name.toLowerCase().includes(needle) || twin.type.toLowerCase().includes(needle),
    );
  }, [query, twins]);

  const loadTwins = useCallback(async (preferredId?: string) => {
    setError('');
    const data = await request<Twin[]>(API, { cache: 'no-store' });
    setTwins(data);
    setSelectedId((current) => (preferredId ?? current) || data[0]?.id || '');
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Mount-time list fetch; React 19 flags any setState scheduled from an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial twin list load
    void loadTwins()
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Load failed.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadTwins]);

  const selectedTwinId = selected?.id ?? '';
  const [panelTwinId, setPanelTwinId] = useState(selectedTwinId);
  if (panelTwinId !== selectedTwinId) {
    setPanelTwinId(selectedTwinId);
    setHistoryEntityId(selected?.entities[0]?.id ?? '');
    setHistory([]);
    setAskAnswer(null);
    setEvents([]);
    setGraph(null);
    setTick(0);
  }

  useEffect(() => {
    if (!createOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCreateOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [createOpen]);

  useEffect(() => {
    if (!selected || tab !== 'History' || !historyEntityId) return;
    request<CurrentState[]>(
      `${API}/${selected.id}/state?entityId=${encodeURIComponent(historyEntityId)}`,
      { cache: 'no-store' },
    )
      .then(setHistory)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'History load failed.'),
      );
  }, [historyEntityId, selected, tab]);

  useEffect(() => {
    if (!selected || tab !== 'Versions') return;
    request<{ versions: Version[]; proposals: Proposal[] }>(
      `${API}/${selected.id}/versions`,
      { cache: 'no-store' },
    )
      .then((data) => {
        setVersions(data.versions);
        setProposals(data.proposals);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Version load failed.'),
      );
  }, [selected, tab]);

  useEffect(() => {
    if (!selected || tab !== 'Events') return;
    request<TwinEvent[]>(`${API}/${selected.id}/events`, { cache: 'no-store' })
      .then(setEvents)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Event load failed.'),
      );
  }, [selected, tab]);

  useEffect(() => {
    if (!selected || tab !== 'Graph') return;
    request<TwinGraph>(`${API}/${selected.id}/graph`, { cache: 'no-store' })
      .then(setGraph)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Graph load failed.'),
      );
  }, [selected, tab]);

  useEffect(() => {
    if (!selected || tab !== 'Scenarios') return;
    request<Scenario[]>(`${API}/${selected.id}/scenarios`, { cache: 'no-store' })
      .then(setScenarios)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Scenario load failed.'),
      );
  }, [selected, tab]);

  async function mutate(label: string, action: () => Promise<void>, success: string) {
    setWorking(label);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Action failed.');
    } finally {
      setWorking('');
    }
  }

  async function createTwin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const type = String(form.get('type') ?? 'GENERIC');
    await mutate(
      'create',
      async () => {
        const created = await request<Twin>(API, {
          method: 'POST',
          body: JSON.stringify({
            name: name || generated?.title,
            type,
            metadata: generated ? { generatedIndustry: generated.industry } : {},
            definition: generated?.definition,
          }),
        });
        await loadTwins(created.id);
        setCreateOpen(false);
        setGenerated(null);
      },
      `${name} was created and persisted.`,
    );
  }

  async function editTwin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim();
    await mutate(
      'edit',
      async () => {
        await request(`${API}/${selected.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        });
        await loadTwins(selected.id);
      },
      'Twin details updated.',
    );
  }

  async function archiveTwin() {
    if (!selected || !window.confirm(`Archive ${selected.name}?`)) return;
    await mutate(
      'archive',
      async () => {
        await request(`${API}/${selected.id}`, { method: 'DELETE' });
        await loadTwins();
      },
      'Twin archived.',
    );
  }

  async function advanceSimulator() {
    if (!selected) return;
    const nextTick = Math.min(tick + 1, 8);
    await mutate(
      'simulator',
      async () => {
        await request(`${API}/${selected.id}/simulator`, {
          method: 'POST',
          body: JSON.stringify({ tick: nextTick }),
        });
        setTick(nextTick);
        await loadTwins(selected.id);
      },
      'Simulated observation persisted with SIMULATED provenance.',
    );
  }

  async function createProposal() {
    if (!selected?.activeVersion) return;
    const now = new Date().toISOString();
    await mutate(
      'proposal',
      async () => {
        await request(`${API}/${selected.id}/versions`, {
          method: 'POST',
          body: JSON.stringify({
            action: 'PROPOSE',
            definition: selected.activeVersion!.definition,
            provenance: {
              source: 'twin-studio-ui',
              classification: 'MANUAL',
              observedAt: now,
              effectiveAt: now,
              ingestedAt: now,
              confidence: 1,
              quality: 1,
              evidenceIds: [selected.activeVersion!.id],
            },
          }),
        });
        const data = await request<{ versions: Version[]; proposals: Proposal[] }>(
          `${API}/${selected.id}/versions`,
        );
        setVersions(data.versions);
        setProposals(data.proposals);
      },
      'Validated proposal created for preview.',
    );
  }

  async function rejectProposal(proposalId: string) {
    if (!selected) return;
    await mutate(
      'reject',
      async () => {
        await request(`${API}/${selected.id}/versions`, {
          method: 'POST',
          body: JSON.stringify({ action: 'REJECT', proposalId, reason: 'Rejected after preview.' }),
        });
        const data = await request<{ versions: Version[]; proposals: Proposal[] }>(
          `${API}/${selected.id}/versions`,
        );
        setVersions(data.versions);
        setProposals(data.proposals);
      },
      'Proposal rejected. Authoritative state was not changed.',
    );
  }

  async function proposeGenerated() {
    if (!selected || !generated) return;
    const now = new Date().toISOString();
    await mutate(
      'proposal',
      async () => {
        await request(`${API}/${selected.id}/versions`, {
          method: 'POST',
          body: JSON.stringify({
            action: 'PROPOSE',
            definition: generated.definition,
            provenance: {
              source: 'deterministic-industry-provider',
              classification: 'INFERRED',
              observedAt: now,
              effectiveAt: now,
              ingestedAt: now,
              confidence: 0.86,
              quality: 1,
              evidenceIds: [`industry:${generated.industry}`],
            },
          }),
        });
        const data = await request<{ versions: Version[]; proposals: Proposal[] }>(
          `${API}/${selected.id}/versions`,
        );
        setVersions(data.versions);
        setProposals(data.proposals);
        setTab('Versions');
      },
      'Generated definition stored as a preview-only proposal.',
    );
  }

  async function applyProposal(proposalId: string) {
    if (!selected || approvedProposalId !== proposalId) return;
    await mutate(
      'apply',
      async () => {
        await request(`${API}/${selected.id}/versions`, {
          method: 'POST',
          body: JSON.stringify({ action: 'APPLY', proposalId, approved: true }),
        });
        setApprovedProposalId('');
        await loadTwins(selected.id);
        const data = await request<{ versions: Version[]; proposals: Proposal[] }>(
          `${API}/${selected.id}/versions`,
        );
        setVersions(data.versions);
        setProposals(data.proposals);
      },
      'Proposal approved and published atomically.',
    );
  }

  async function createScenario() {
    if (!selected) return;
    const entity = selected.entities.find((item) => item.currentState) ?? selected.entities[0];
    await mutate(
      'scenario-create',
      async () => {
        await request(`${API}/${selected.id}/scenarios`, {
          method: 'POST',
          body: JSON.stringify(
            entity
              ? {
                  name: `${entity.name} outage`,
                  kind: 'ENTITY_OUTAGE',
                  inputs: {
                    entityId: entity.id,
                    throughputChangePercent: -23,
                    downtimeHours: 4.5,
                  },
                }
              : {
                  name: 'Capacity increase',
                  kind: 'CAPACITY_CHANGE',
                  inputs: { capacityChangePercent: 15, projectedUtilizationPercent: 88 },
                },
          ),
        });
        setScenarios(await request<Scenario[]>(`${API}/${selected.id}/scenarios`));
      },
      'Scenario configuration persisted.',
    );
  }

  async function runScenario(scenarioId: string) {
    if (!selected) return;
    await mutate(
      'scenario-run',
      async () => {
        await request(`${API}/${selected.id}/scenarios`, {
          method: 'POST',
          body: JSON.stringify({ action: 'RUN', scenarioId }),
        });
        setScenarios(await request<Scenario[]>(`${API}/${selected.id}/scenarios`));
      },
      'Scenario completed against an isolated snapshot.',
    );
  }

  async function ingestObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const entityId = String(form.get('entityId') ?? '');
    const source = String(form.get('source') ?? '').trim();
    const rawState = String(form.get('state') ?? '').trim();
    let state: JsonObject;
    try {
      const parsed = JSON.parse(rawState) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('State must be a JSON object.');
      }
      state = parsed as JsonObject;
    } catch {
      setError('VALIDATION_ERROR: State must be valid JSON.');
      return;
    }
    const observedAtRaw = String(form.get('observedAt') ?? '').trim();
    const observedAt = observedAtRaw ? new Date(observedAtRaw).toISOString() : new Date().toISOString();
    if (Number.isNaN(Date.parse(observedAt))) {
      setError('Observed at must be a valid date.');
      return;
    }
    await mutate(
      'ingest',
      async () => {
        await request(`${API}/${selected.id}/state`, {
          method: 'POST',
          body: JSON.stringify({
            entityId,
            state,
            provenance: {
              source,
              classification: 'OBSERVED',
              observedAt,
              effectiveAt: observedAt,
              ingestedAt: new Date().toISOString(),
              confidence: 1,
              quality: 1,
              evidenceIds: [source],
            },
          }),
        });
        await loadTwins(selected.id);
      },
      'Measured observation persisted with OBSERVED provenance.',
    );
  }

  async function askTwin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const prompt = String(new FormData(event.currentTarget).get('prompt') ?? '').trim();
    await mutate(
      'ask',
      async () => {
        setAskAnswer(
          await request<JsonObject>(`${API}/${selected.id}/ask`, {
            method: 'POST',
            body: JSON.stringify({ prompt }),
          }),
        );
      },
      'Answer generated by the configured LLM from durable twin state.',
    );
  }

  if (loading) {
    return <main className="centerState" aria-busy="true">Loading Twin Studio…</main>;
  }

  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand">CH<span>/TWIN</span></div>
        <button className="primary full" onClick={() => setCreateOpen(true)}>Create twin</button>
        <label htmlFor="twin-search">Search twins</label>
        <input
          id="twin-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name or type"
        />
        <nav aria-label="Digital twins">
          {visibleTwins.length === 0 && <p className="muted">No twins match this filter.</p>}
          {visibleTwins.map((twin) => (
            <button
              className={selected?.id === twin.id ? 'active' : ''}
              key={twin.id}
              onClick={() => setSelectedId(twin.id)}
            >
              <span>{twin.name}</span>
              <small>{twin.type}</small>
            </button>
          ))}
        </nav>
        <p className="railNote">
          PHASE 2 CONTROL PLANE<br />
          POSTGRES AUTHORITATIVE
        </p>
      </aside>

      <section className="workspace">
        {error && <div className="banner error" role="alert">{error}</div>}
        {notice && <div className="banner success" role="status">{notice}</div>}
        {!selected ? (
          <section className="emptyState">
            <h1>No digital twins</h1>
            <p>Create a twin to begin defining entities and recording state.</p>
            <button className="primary" onClick={() => setCreateOpen(true)}>Create twin</button>
          </section>
        ) : (
          <>
            <header className="top">
              <div>
                <p className="eyebrow">Digital twin / {selected.type.toLowerCase()}</p>
                <h1>{selected.name}</h1>
              </div>
              <div className="topMeta">
                <span className="sim">DURABLE</span>
                <span><b>{selected.status}</b><small>lifecycle</small></span>
                <span><b>v{selected.activeVersion?.versionNumber ?? '—'}</b><small>active version</small></span>
                <span><b>{selected.entities.length}</b><small>entities</small></span>
              </div>
            </header>

            <div className="tabs" role="tablist" aria-label="Twin views">
              {tabs.map((item) => (
                <button
                  key={item}
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <section className="tabPanel" role="tabpanel">
              {tab === 'Overview' && (
                <>
                  <section className="hero">
                    <div>
                      <p className="eyebrow">Authoritative state</p>
                      <h2>{selected.entities.filter((entity) => entity.currentState).length} current projections</h2>
                      <p>Simulated ticks write SIMULATED provenance. Measured observations are ingested from Live state. Definition rules open and clear persisted events after those writes.</p>
                    </div>
                    <div className="actions">
                      <button
                        className="primary"
                        disabled={working === 'simulator' || tick >= 8}
                        onClick={advanceSimulator}
                      >
                        {working === 'simulator' ? 'Persisting…' : 'Advance simulated tick'}
                      </button>
                      <button onClick={() => setTab('History')}>View history</button>
                    </div>
                  </section>
                  {selected.entities.length === 0 && (
                    <p className="muted">This twin has no entities in the active version.</p>
                  )}
                  <section className="cardGrid">
                    {selected.entities.map((entity) => (
                      <article key={entity.id}>
                        <label>{entity.typeKey}</label>
                        <h3>{entity.name}</h3>
                        {entity.currentState ? (
                          <>
                            <JsonView value={entity.currentState.state} />
                            <small>
                              {entity.currentState.classification} · {entity.currentState.source} ·{' '}
                              {new Date(entity.currentState.effectiveAt).toLocaleString()}
                            </small>
                          </>
                        ) : (
                          <p className="muted">No state recorded.</p>
                        )}
                      </article>
                    ))}
                  </section>
                  <form className="inlineForm" onSubmit={editTwin}>
                    <label htmlFor="edit-name">Twin name</label>
                    <input id="edit-name" name="name" defaultValue={selected.name} required maxLength={160} />
                    <button disabled={working === 'edit'}>Save name</button>
                    <button className="dangerButton" type="button" onClick={archiveTwin}>Archive</button>
                  </form>
                </>
              )}

              {tab === 'Live state' && (
                <section className="stack">
                  <header>
                    <h2>Current state projection</h2>
                    <p>Latest business-effective state per entity. Ingest measured observations here; simulated ticks stay classified as SIMULATED.</p>
                  </header>
                  {selected.entities.map((entity) => (
                    <article className="dataRow" key={entity.id}>
                      <div><strong>{entity.name}</strong><small>{entity.key} · {entity.currentState?.classification ?? 'NO STATE'}</small></div>
                      {entity.currentState ? <JsonView value={entity.currentState.state} /> : <span>No state</span>}
                    </article>
                  ))}
                  <form className="stack" onSubmit={ingestObservation}>
                    <h3>Ingest measured observation</h3>
                    <label htmlFor="ingest-entity">Entity</label>
                    <select id="ingest-entity" name="entityId" required defaultValue={selected.entities[0]?.id}>
                      {selected.entities.map((entity) => (
                        <option value={entity.id} key={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                    <label htmlFor="ingest-source">Source</label>
                    <input id="ingest-source" name="source" required maxLength={160} placeholder="line-sensor-07" />
                    <label htmlFor="ingest-observed-at">Observed at</label>
                    <input id="ingest-observed-at" name="observedAt" type="datetime-local" />
                    <label htmlFor="ingest-state">State JSON</label>
                    <textarea id="ingest-state" name="state" required defaultValue="{}" />
                    <button className="primary" disabled={working === 'ingest' || selected.entities.length === 0}>
                      {working === 'ingest' ? 'Persisting…' : 'Ingest observed state'}
                    </button>
                  </form>
                </section>
              )}

              {tab === 'Graph' && (
                <section className="stack">
                  <header>
                    <h2>Relationship graph</h2>
                    <p>
                      Nodes are persisted entities. Edges are inferred only when an entity attribute
                      references another entity key and a matching relationship type exists in the
                      active definition.
                    </p>
                  </header>
                  {!graph || graph.nodes.length === 0 ? (
                    <p className="muted">No persisted entities to graph.</p>
                  ) : (
                    <>
                      <h3>Nodes</h3>
                      {graph.nodes.map((node) => (
                        <article className="dataRow" key={node.id}>
                          <div>
                            <strong>{node.name}</strong>
                            <small>{node.key} · {node.typeKey}</small>
                          </div>
                          <span className="muted">{node.id}</span>
                        </article>
                      ))}
                      <h3>Edges</h3>
                      {graph.edges.length === 0 ? (
                        <p className="muted">
                          No relationship edges were inferred from persisted entity attributes.
                        </p>
                      ) : (
                        graph.edges.map((edge) => (
                          <article className="dataRow" key={edge.id}>
                            <div>
                              <strong>{edge.fromKey} → {edge.toKey}</strong>
                              <small>{edge.type} via {edge.viaAttribute}</small>
                            </div>
                          </article>
                        ))
                      )}
                    </>
                  )}
                </section>
              )}

              {tab === 'Events' && (
                <section className="stack">
                  <header>
                    <h2>Rule events</h2>
                    <p>
                      Events are written when a definition rule becomes true against persisted current
                      state, and cleared when that rule is no longer true. They are not invented from
                      the UI.
                    </p>
                  </header>
                  {events.length === 0 ? (
                    <p className="muted">
                      No rule events. Ingest an observation or advance a simulated tick that satisfies
                      an active definition rule.
                    </p>
                  ) : (
                    <div className="timeline">
                      {events.map((event) => (
                        <article key={event.id}>
                          <strong className={event.status === 'OPEN' ? 'eventOpen' : 'eventCleared'}>
                            {event.status} · {event.ruleKey}
                          </strong>
                          <span>{event.entity.name} · {event.classification} · {event.source}</span>
                          <span>Opened {new Date(event.openedAt).toLocaleString()}</span>
                          {event.clearedAt && (
                            <span>Cleared {new Date(event.clearedAt).toLocaleString()}</span>
                          )}
                          <p>{event.message}</p>
                          <JsonView value={event.state} />
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {tab === 'History' && (
                <section className="stack">
                  <header>
                    <h2>Temporal state history</h2>
                    <label htmlFor="history-entity">Entity</label>
                    <select
                      id="history-entity"
                      value={historyEntityId}
                      onChange={(event) => setHistoryEntityId(event.target.value)}
                    >
                      {selected.entities.map((entity) => (
                        <option value={entity.id} key={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                  </header>
                  {history.length === 0 ? <p className="muted">No observations recorded.</p> : (
                    <div className="timeline">
                      {history.map((item, index) => (
                        <article key={`${item.ingestedAt}-${index}`}>
                          <strong>{item.classification}</strong>
                          <span>Observed {new Date(item.observedAt).toLocaleString()}</span>
                          <span>Effective {new Date(item.effectiveAt).toLocaleString()}</span>
                          <span>Ingested {new Date(item.ingestedAt).toLocaleString()}</span>
                          <JsonView value={item.state} />
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {tab === 'Versions' && (
                <section className="stack">
                  <header className="sectionHead">
                    <div><h2>Version lifecycle</h2><p>Generate → validate → preview → approve → persist.</p></div>
                    <button disabled={working === 'proposal'} onClick={createProposal}>Create proposal</button>
                  </header>
                  <div className="split">
                    <div>
                      <h3>Published history</h3>
                      {versions.length === 0 && <p className="muted">No published versions.</p>}
                      {versions.map((version) => (
                        <article className="dataRow" key={version.id}>
                          <div><strong>Version {version.versionNumber}</strong><small>{version.status}</small></div>
                          <time>{new Date(version.createdAt).toLocaleString()}</time>
                        </article>
                      ))}
                    </div>
                    <div>
                      <h3>Proposals</h3>
                      {proposals.length === 0 && <p className="muted">No proposals.</p>}
                      {proposals.map((proposal) => (
                        <article className="proposal" key={proposal.id}>
                          <div className="sectionHead">
                            <strong>{proposal.status}</strong>
                            <span>Schema {proposal.schemaValid ? 'valid' : 'invalid'} · Policy {proposal.policyValid ? 'valid' : 'invalid'}</span>
                          </div>
                          <details><summary>Preview definition</summary><JsonView value={proposal.definition} /></details>
                          {proposal.status === 'PREVIEW' && (
                            <>
                              <label className="check">
                                <input
                                  type="checkbox"
                                  checked={approvedProposalId === proposal.id}
                                  onChange={(event) => setApprovedProposalId(event.target.checked ? proposal.id : '')}
                                />
                                I reviewed this definition and approve publication.
                              </label>
                              <button
                                className="primary"
                                disabled={approvedProposalId !== proposal.id || working === 'apply'}
                                onClick={() => applyProposal(proposal.id)}
                              >
                                Approve and publish
                              </button>
                              <button
                                type="button"
                                disabled={working === 'reject'}
                                onClick={() => rejectProposal(proposal.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {tab === 'Scenarios' && (
                <section className="stack">
                  <header className="sectionHead">
                    <div><h2>Scenario runs</h2><p>Runs use isolated persisted snapshots and never mutate live state.</p></div>
                    <button disabled={working === 'scenario-create'} onClick={createScenario}>Create scenario</button>
                  </header>
                  {scenarios.length === 0 && <p className="muted">No saved scenarios.</p>}
                  {scenarios.map((scenario) => (
                    <article className="proposal" key={scenario.id}>
                      <div className="sectionHead">
                        <div><strong>{scenario.name}</strong><small>{scenario.kind}</small></div>
                        <button disabled={working === 'scenario-run'} onClick={() => runScenario(scenario.id)}>Run</button>
                      </div>
                      <JsonView value={scenario.inputs} />
                      {scenario.runs.map((run) => (
                        <div className="runResult" key={run.id}>
                          <span>{run.status}</span>
                          <JsonView value={run.result} />
                        </div>
                      ))}
                    </article>
                  ))}
                </section>
              )}

              {tab === 'Ask twin' && (
                <section className="askPanel">
                  <h2>Ask your twin</h2>
                  <p>
                    Answers come from the configured OpenAI or Anthropic model and are grounded only in
                    stored twin state. If no API key is configured, the request fails instead of inventing
                    an answer.
                  </p>
                  <form onSubmit={askTwin}>
                    <label htmlFor="prompt">Question</label>
                    <textarea id="prompt" name="prompt" required maxLength={2000} defaultValue="What is the current state?" />
                    <button className="primary" disabled={working === 'ask'}>{working === 'ask' ? 'Reviewing state…' : 'Ask'}</button>
                  </form>
                  {askAnswer && <JsonView value={askAnswer} />}
                </section>
              )}

              {tab === 'Generate' && (
                <section className="stack">
                  <IndustryGenerator
                    disabled={Boolean(working)}
                    onGenerated={(proposal) =>
                      setGenerated({
                        title: proposal.title,
                        industry: proposal.industry,
                        definition: proposal.definition,
                      })
                    }
                  />
                  {generated && selected && (
                    <div className="actions">
                      <button disabled={working === 'proposal'} onClick={proposeGenerated}>
                        Propose for {selected.name}
                      </button>
                      <button onClick={() => setCreateOpen(true)}>Create new twin from preview</button>
                    </div>
                  )}
                </section>
              )}
            </section>
          </>
        )}
      </section>

      {createOpen && (
        <div className="modalBackdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <button className="modalClose" aria-label="Close create twin dialog" onClick={() => setCreateOpen(false)}>×</button>
            <p className="eyebrow">Durable creation</p>
            <h2 id="create-title">Create digital twin</h2>
            <form onSubmit={createTwin}>
              <label htmlFor="create-name">Name</label>
              <input
                id="create-name"
                name="name"
                required
                minLength={2}
                maxLength={160}
                autoFocus
                defaultValue={generated?.title ?? ''}
              />
              <label htmlFor="create-type">Domain</label>
              <select id="create-type" name="type" defaultValue="GENERIC">
                <option value="GENERIC">Generic</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="AIRPORT">Airport</option>
                <option value="BANKING">Banking</option>
                <option value="SUPPLY_CHAIN">Supply chain</option>
              </select>
              {generated && (
                <p className="muted">
                  A generated {generated.industry} definition is ready and will be persisted only after
                  you create the twin.
                </p>
              )}
              <button className="primary" disabled={working === 'create'}>
                {working === 'create' ? 'Creating…' : 'Create twin'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
