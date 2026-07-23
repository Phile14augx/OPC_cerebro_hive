import { useQuery } from '@tanstack/react-query';
import { WorkflowClient } from '@cerebro/sdk';

const workflowClient = new WorkflowClient('http://localhost:3000'); // Mocked URL for now

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowClient.listWorkflows(),
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowClient.getWorkflow(id),
    enabled: !!id,
  });
}
