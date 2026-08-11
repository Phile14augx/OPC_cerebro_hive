
import React from 'react';
import { CardContent } from '@cerebro/ui';

export const TaskGraphWidget = () => {
  return (
    <CardContent className="flex flex-col items-center justify-center py-8">
      <p className="text-sm text-[var(--color-text-muted)] italic">DAG Visualizer canvas goes here</p>
    </CardContent>
  );
};
