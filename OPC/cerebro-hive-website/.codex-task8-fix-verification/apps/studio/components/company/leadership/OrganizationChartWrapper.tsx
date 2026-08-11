"use client";

import dynamic from 'next/dynamic';

export const OrganizationChartWrapper = dynamic(
  () => import('./OrganizationChartCanvas').then((mod) => mod.OrganizationChartCanvas),
  { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center text-text-muted border border-border rounded-3xl bg-surface-elevated">Loading Organization Chart...</div> }
);
