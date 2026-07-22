export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

export type MetricSource = "hiveforge" | "cerebrostudio" | "cerebroswarm" | "mock";
export type MetricStatus = "healthy" | "warning" | "critical";
export type Trend = "up" | "down" | "flat";
export type WidgetType = "kpi" | "line" | "bar" | "pie" | "table";

export interface Metric {
  key: string; name: string; unit: string; source: MetricSource;
  value: number; trend: Trend; status: MetricStatus; history: number[]; updatedAt: string;
}

export interface Widget { id: string; type: WidgetType; title: string; metricKeys: string[]; order: number }
export interface Dashboard { id: string; name: string; widgets: Widget[]; createdAt: string }
export interface AlertRule { id: string; metricKey: string; condition: "gt" | "lt"; threshold: number }
export interface Alert { id: string; metricKey: string; message: string; severity: "warning" | "critical"; createdAt: string }
export interface InsightCard { id: string; metricKey: string; narrative: string; createdAt: string }

export function formatValue(unit: string, value: number): string {
  if (unit === "usd") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (unit === "score") return `${value}`;
  return value.toLocaleString();
}
