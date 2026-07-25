export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...(init?.body ? { "content-type": "application/json" } : {}), authorization: `Bearer ${KEY}`, ...(init?.headers ?? {}) } });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`); }
  return res.json() as Promise<T>;
}
export async function checkOnline(): Promise<boolean> { try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; } }

export type MemoryType = "working" | "episodic" | "semantic" | "long_term";
export interface Memory {
  id: string; agentId: string; memoryType: MemoryType;
  content: string; importance: number; accessCount: number;
  createdAt: string; lastAccessedAt?: string; expiresAt?: string;
}
export interface ForecastResult { forecasts: Array<{ step: number; value: number }> }
export interface OptimizeResult { selectedItems: Array<{ id: string; value: number; weight: number }>; totalValue: number; totalWeight: number }
