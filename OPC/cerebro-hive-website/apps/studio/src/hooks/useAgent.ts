import { useQuery } from '@tanstack/react-query';
import { AgentClient } from '@cerebro/sdk';

const agentClient = new AgentClient(process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3406");

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentClient.listAgents(),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentClient.getAgent(id),
    enabled: !!id,
  });
}
