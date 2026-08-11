import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromptClient } from '@cerebro/sdk';

const promptClient = new PromptClient('http://localhost:3000'); // Mocked URL for now

export function usePrompts() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: () => promptClient.listPrompts(),
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: () => promptClient.getPrompt(id),
    enabled: !!id,
  });
}
