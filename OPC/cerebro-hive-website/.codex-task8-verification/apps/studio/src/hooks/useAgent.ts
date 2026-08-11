import { useQuery } from '@tanstack/react-query';
import { AgentClient } from '@cerebro/sdk';

const agentClient = new AgentClient('http://localhost:3000'); // Mocked URL for now

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
