'use client';

import React from 'react';
import type { HealthStatus, AlertSeverity } from '../lib/types';

/* ── Status maps ─────────────────────────────────────────────────────────── */
export const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--status-healthy)',
  degraded: 'var(--status-degraded)',
  critical: 'var(--status-critical)',
  unknown:  'var(--status-unknown)',
  offline:  'var(--status-offline)',
};

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#6b7280',
  info:     '#38bdf8',
};

/* ── SphereCard ──────────────────────────────────────────────────────────── */
interface SphereCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  glowColor?: string;
  style?: React.CSSProperties;
}

export function SphereCard({ children, className = '', interactive, onClick, glowColor, style }: SphereCardProps) {
  return (
    <div
      onClick={onClick}
      className={`sphere-card${interactive ? ' interactive' : ''} ${className}`}
      style={{
        ...(glowColor ? { borderColor: glowColor, boxShadow: `0 0 0 1px ${glowColor}20` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SphereCardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      {children}
    </div>
  );
}

export function SphereCardBody({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ padding: '16px', ...style }}>
      {children}
    </div>
  );
}

/* ── StatusDot ───────────────────────────────────────────────────────────── */
export function StatusDot({ status, size = 8 }: { status: HealthStatus; size?: number }) {
  return (
    <span
      className={`status-dot ${status}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}

/* ── SeverityBadge ───────────────────────────────────────────────────────── */
export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const color = SEV_COLOR[severity];
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30`, flexShrink: 0 }}
    >
      {severity.toUpperCase()}
    </span>
  );
}

/* ── TrendBadge ──────────────────────────────────────────────────────────── */
export function TrendBadge({ value, formatted, inverted = false }: { value: number; formatted: string; inverted?: boolean }) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral  = Math.abs(value) < 0.01;
  const color = isNeutral ? 'var(--text-muted)' : isPositive ? 'var(--status-healthy)' : 'var(--status-critical)';
  const arrow = isNeutral ? '→' : value > 0 ? '↑' : '↓';
  return (
    <span className="text-xs font-medium" style={{ color }}>
      {arrow} {formatted}
    </span>
  );
}

/* ── MetricTile ──────────────────────────────────────────────────────────── */
export function MetricTile({
  label, value, sub, color, trend,
}: { label: string; value: string; sub?: string; color?: string; trend?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold leading-none" style={{ color: color ?? 'var(--text-primary)' }}>{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1.5">
          {trend}
          {sub && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────────────────────────── */
export function ProgressBar({ value, color, height = 4 }: { value: number; color: string; height?: number }) {
  return (
    <div style={{ height, background: 'var(--border-default)', borderRadius: height / 2 }}>
      <div
        style={{
          height, background: color, borderRadius: height / 2,
          width: `${Math.min(100, Math.max(0, value))}%`,
          transition: 'width 600ms ease',
        }}
      />
    </div>
  );
}

/* ── AI Badge ────────────────────────────────────────────────────────────── */
const AI_COLORS = { claude: '#6366f1', codex: '#22c55e', gemini: '#38bdf8' };
const AI_LABELS = { claude: 'Claude', codex: 'Codex', gemini: 'Gemini' };

export function AIBadge({ ai }: { ai: 'claude' | 'codex' | 'gemini' }) {
  const color = AI_COLORS[ai];
  return (
    <span
      className="text-xs font-semibold px-1.5 py-0.5 rounded"
      style={{ background: `${color}18`, color, border: `1px solid ${color}25`, flexShrink: 0 }}
    >
      {AI_LABELS[ai]}
    </span>
  );
}

/* ── LoadingSkeleton ─────────────────────────────────────────────────────── */
export function Skeleton({ width = '100%', height = 16, className = '' }: { width?: string | number; height?: number; className?: string }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ width, height, background: 'var(--bg-elevated)' }}
    />
  );
}
