'use client';
import { useState, useEffect, useCallback } from 'react';
import { forgeApi } from './api-client';
import type { ForgeProject, ForgeProjectDetail, CodegenEvent } from './api-client';

// ─── Project list ─────────────────────────────────────────────────────────────

export function useForgeProjects(organizationId?: string) {
  const [projects, setProjects] = useState<ForgeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forgeApi.projects.list(organizationId);
      setProjects(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { projects, loading, error, refresh };
}

// ─── Single project ───────────────────────────────────────────────────────────

export function useForgeProject(id: string) {
  const [project, setProject] = useState<ForgeProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forgeApi.projects.get(id);
      setProject(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { project, loading, error, refresh };
}

// ─── Planner ──────────────────────────────────────────────────────────────────

export function useForgeActions(projectId: string) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPlanner = useCallback(async (prompt: string) => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.planner.run(projectId, prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Planner failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runRequirements = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.requirements.generate(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Requirements generation failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runArchitect = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.architect.design(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Architecture design failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runTesting = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.testing.generate(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Testing generation failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runDeploy = useCallback(async (environment = 'production') => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.deploy.generate(projectId, environment);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deployment generation failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runReview = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.review.run(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code review failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  const runDocs = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      return await forgeApi.docs.generate(projectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Docs generation failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [projectId]);

  return { running, error, runPlanner, runRequirements, runArchitect, runTesting, runDeploy, runReview, runDocs };
}

// ─── Codegen SSE ──────────────────────────────────────────────────────────────

export interface CodegenState {
  running: boolean;
  events: CodegenEvent[];
  activeAgent: string | null;
  files: Record<string, string>;   // filePath → accumulated content
  done: boolean;
  error: string | null;
}

export function useCodegen(projectId: string) {
  const [state, setState] = useState<CodegenState>({
    running: false,
    events: [],
    activeAgent: null,
    files: {},
    done: false,
    error: null,
  });

  const start = useCallback(() => {
    setState(s => ({ ...s, running: true, events: [], files: {}, done: false, error: null }));

    const stop = forgeApi.codegen.start(projectId, (event) => {
      setState(s => {
        const events = [...s.events, event];
        let { activeAgent, files, done, error } = s;

        if (event.type === 'agent_start') activeAgent = event.agentType ?? null;
        if (event.type === 'chunk' && event.filePath && event.chunk) {
          files = { ...files, [event.filePath]: (files[event.filePath] ?? '') + event.chunk };
        }
        if (event.type === 'done') { done = true; }
        if (event.type === 'error') error = event.error ?? 'Unknown error';

        const running = !done && !error;
        return { ...s, events, activeAgent, files, done, error, running };
      });
    });

    return stop;
  }, [projectId]);

  return { state, start };
}
