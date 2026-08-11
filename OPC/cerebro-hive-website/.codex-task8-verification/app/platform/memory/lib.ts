// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type MemoryType = "working" | "episodic" | "semantic" | "long_term";
export interface Memory {
  id: string; agentId: string; memoryType: MemoryType;
  content: string; importance: number; accessCount: number;
  createdAt: string; lastAccessedAt?: string; expiresAt?: string;
}
export interface ForecastResult { forecasts: Array<{ step: number; value: number }> }
export interface OptimizeResult { selectedItems: Array<{ id: string; value: number; weight: number }>; totalValue: number; totalWeight: number }
