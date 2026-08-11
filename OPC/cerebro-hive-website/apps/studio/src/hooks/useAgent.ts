import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgentClient } from '@cerebro/sdk';
import { useAuth } from '@/components/auth/AuthProvider';

export function useAgentClient() {
  const { session } = useAuth();
  return useMemo(() => {
    const workspaceId = typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_WORKSPACE_ID
      : window.localStorage.getItem('cerebro.workspaceId') ?? process.env.NEXT_PUBLIC_WORKSPACE_ID;
    return new AgentClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
    });
  }, [session]);
}

export function useAgents() {
  const agentClient = useAgentClient();
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentClient.listAgents(),
  });
}

export function useAgent(id: string) {
  const agentClient = useAgentClient();
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentClient.getAgent(id),
    enabled: !!id,
  });
}
