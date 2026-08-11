'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  PublishAgentDraftCommand,
  TransitionAgentLifecycleCommand,
  UpdateAgentDraftCommand,
} from '@cerebro/agent-registry-contracts';
import { useAgentClient } from './useAgent';

export const agentRegistryKeys = {
  all: ['agent-registry'] as const,
  list: () => [...agentRegistryKeys.all, 'list'] as const,
  detail: (id: string) => [...agentRegistryKeys.all, 'detail', id] as const,
  draft: (id: string) => [...agentRegistryKeys.detail(id), 'draft'] as const,
  versions: (id: string) => [...agentRegistryKeys.detail(id), 'versions'] as const,
};

function useInvalidateAgent(id?: string) {
  const client = useQueryClient();
  return async () => {
    await client.invalidateQueries({ queryKey: agentRegistryKeys.list() });
    if (id) await client.invalidateQueries({ queryKey: agentRegistryKeys.detail(id) });
  };
}

export function useAgentRegistryList() {
  const agentClient = useAgentClient();
  return useQuery({ queryKey: agentRegistryKeys.list(), queryFn: () => agentClient.listAgents() });
}

export function useAgentRegistryDetail(id: string) {
  const agentClient = useAgentClient();
  return useQuery({ queryKey: agentRegistryKeys.detail(id), queryFn: () => agentClient.getAgent(id), enabled: Boolean(id) });
}

export function useAgentDraft(id: string) {
  const agentClient = useAgentClient();
  return useQuery({ queryKey: agentRegistryKeys.draft(id), queryFn: () => agentClient.getDraft(id), enabled: Boolean(id) });
}

export function useAgentVersions(id: string) {
  const agentClient = useAgentClient();
  return useQuery({ queryKey: agentRegistryKeys.versions(id), queryFn: () => agentClient.listVersions(id), enabled: Boolean(id) });
}

export function useCreateAgent() {
  const agentClient = useAgentClient();
  const invalidate = useInvalidateAgent();
  return useMutation({ mutationFn: (input: { name: string; description?: string }) => agentClient.createAgent(input), onSuccess: invalidate });
}

export function useUpdateAgentDraft(id: string) {
  const agentClient = useAgentClient();
  const invalidate = useInvalidateAgent(id);
  return useMutation({ mutationFn: (command: UpdateAgentDraftCommand) => agentClient.updateDraft(id, command), onSuccess: invalidate });
}

export function usePublishAgentDraft(id: string) {
  const agentClient = useAgentClient();
  const invalidate = useInvalidateAgent(id);
  return useMutation({
    mutationFn: (command: PublishAgentDraftCommand) => agentClient.publishDraft(id, command, `agent-publish:${id}:revision:${command.expectedDraftRevision}`),
    onSettled: invalidate,
  });
}

export function useTransitionAgentLifecycle(id: string) {
  const agentClient = useAgentClient();
  const invalidate = useInvalidateAgent(id);
  return useMutation({ mutationFn: (command: TransitionAgentLifecycleCommand) => agentClient.transitionLifecycle(id, command), onSuccess: invalidate });
}
