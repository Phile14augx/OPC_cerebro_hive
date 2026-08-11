// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";






// ---------------- Context Engine ----------------

export interface ContextSection { source: string; title: string; content: string; tokens: number; priority: number }
export interface ContextBundle { sections: ContextSection[]; totalTokens: number; budget: number; assembledAt: string; rendered: string }

// ---------------- Intelligence Hub (ask) ----------------

export interface HubAskResponse { answer: string }
