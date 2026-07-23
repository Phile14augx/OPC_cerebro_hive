import { useQuery } from '@tanstack/react-query';
import { EvaluationClient } from '@cerebro/sdk';

const evalClient = new EvaluationClient('http://localhost:3000'); // Mocked URL for now

export function useEvaluators() {
  return useQuery({
    queryKey: ['evaluators'],
    queryFn: () => evalClient.listEvaluators(),
  });
}

export function useDatasets() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: () => evalClient.listDatasets(),
  });
}

export function useDatasetItems(datasetId: string) {
  return useQuery({
    queryKey: ['datasetItems', datasetId],
    queryFn: () => evalClient.getDatasetItems(datasetId),
    enabled: !!datasetId,
  });
}

export function useEvaluationProfiles() {
  return useQuery({
    queryKey: ['evaluationProfiles'],
    queryFn: () => evalClient.listProfiles(),
  });
}

export function useEvaluationRuns() {
  return useQuery({
    queryKey: ['evaluationRuns'],
    queryFn: () => evalClient.listRuns(),
  });
}
