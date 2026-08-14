import { useQuery } from '@tanstack/react-query';
import { WorkflowClient } from '@cerebro/sdk';

const workflowClient = new WorkflowClient(process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3406");

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
