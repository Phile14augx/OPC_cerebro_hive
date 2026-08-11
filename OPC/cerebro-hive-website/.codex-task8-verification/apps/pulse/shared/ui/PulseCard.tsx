'use client';

import React from 'react';
import type { HealthStatus } from '../lib/types';

/* ── Status colour map ──────────────────────────────────────────────────── */
export const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--color-text-success)',
  degraded: 'var(--color-text-warning)',
  critical: 'var(--color-text-danger)',
  unknown:  'var(--color-text-muted)',
};
export const STATUS_BG: Record<HealthStatus, string> = {
  healthy:  'rgba(34,197,94,0.10)',
  degraded: 'rgba(245,158,11,0.10)',
  critical: 'rgba(239,68,68,0.10)',
  unknown:  'rgba(113,113,122,0.10)',
};

/* ── PulseCard ────────────────────────────────────────────────────────────── */
interface PulseCardProps {
  children: React.ReactNode;
  className?: string;
  /** Highlights the card border with a status colour */
  status?: HealthStatus;
  onClick?: () => void;
}

export function PulseCard({ children, className = '', status, onClick }: PulseCardProps) {
  const borderColor = status ? STATUS_COLOR[status] : 'var(--color-border-default)';
  return (
    <div
      onClick={onClick}
      style={{ borderColor }}
      className={[
        'rounded-[var(--radius-lg)] border bg-[var(--color-surface-default)]',
        'transition-all duration-200',
        onClick ? 'cursor-pointer hover:bg-[var(--color-surface-raised)]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/* ── PulseCardHeader ─────────────────────────────────────────────────────── */
export function PulseCardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-[var(--color-border-subtle)] ${className}`}>
      {children}
    </div>
  );
}

/* ── PulseCardBody ───────────────────────────────────────────────────────── */
export function PulseCardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

/* ── StatusDot ───────────────────────────────────────────────────────────── */
export function StatusDot({ status, pulse = false }: { status: HealthStatus; pulse?: boolean }) {
  return (
    <span
      className={pulse && status === 'critical' ? 'alert-flash' : ''}
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: STATUS_COLOR[status],
        boxShadow: `0 0 6px ${STATUS_COLOR[status]}`,
        flexShrink: 0,
      }}
    />
  );
}

/* ── TrendBadge ──────────────────────────────────────────────────────────── */
interface TrendBadgeProps {
  delta: number;
  deltaFormatted: string;
  direction?: 'up' | 'down' | 'flat';
  /** Whether up is positive (revenue) or negative (latency, churn) */
  invertedLogic?: boolean;
}

export function TrendBadge({ delta, deltaFormatted, direction, invertedLogic = false }: TrendBadgeProps) {
  const dir = direction ?? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat');
  const isPositive = invertedLogic ? dir === 'down' : dir === 'up';
  const color = dir === 'flat'
    ? 'var(--color-text-muted)'
    : isPositive ? 'var(--color-text-success)' : 'var(--color-text-danger)';
  const bg = dir === 'flat'
    ? 'rgba(113,113,122,0.10)'
    : isPositive ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)';
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';

  return (
    <span
      style={{ color, background: bg }}
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-medium"
    >
      {arrow} {deltaFormatted}
    </span>
  );
}

/* ── SeverityPip ─────────────────────────────────────────────────────────── */
const SEV_COLOR: Record<string, string> = {
  critical: 'var(--color-text-danger)',
  high:     'var(--color-text-warning)',
  medium:   '#f59e0b',
  low:      'var(--color-text-info)',
  info:     'var(--color-text-muted)',
};

export function SeverityBadge({ severity }: { severity: string }) {
  const color = SEV_COLOR[severity] ?? 'var(--color-text-muted)';
  return (
    <span
      style={{ color, border: `1px solid ${color}`, background: `${color}18` }}
      className="text-xs font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide"
    >
      {severity}
    </span>
  );
}
