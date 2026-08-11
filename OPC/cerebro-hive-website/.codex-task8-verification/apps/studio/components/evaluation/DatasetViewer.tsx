'use client';

import { useDatasetItems } from '@/src/hooks/useEvaluation';
import { useEvaluationStudioStore } from '@/src/store/useEvaluationStudioStore';

export function DatasetViewer() {
  const { selectedDatasetId } = useEvaluationStudioStore();
  
  // Hardcode ds-1 if none selected just for demo purposes
  const datasetId = selectedDatasetId || 'ds-1';
  const { data: items, isLoading } = useDatasetItems(datasetId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-muted/5 shrink-0">
        <div>
          <h2 className="font-semibold">Dataset: {datasetId}</h2>
          <div className="text-xs text-muted-foreground mt-0.5">Golden Test Cases</div>
        </div>
        <div className="flex gap-2">
          <button className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded">Import CSV/JSON</button>
          <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded">Add Row</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading dataset items...</div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-1/3">Input</th>
                  <th className="px-4 py-3 w-1/3">Expected Output</th>
                  <th className="px-4 py-3">Context</th>
                  <th className="px-4 py-3">Labels</th>
                  <th className="px-4 py-3 w-20 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map(item => (
                  <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[200px]">{item.input}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="truncate max-w-[200px]">{item.expectedOutput || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="truncate max-w-[150px]">{item.context || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.labels.map(l => (
                          <span key={l} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
