export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}), ...init?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) }); return true; }
  catch { return false; }
}

export type SearchResult = { chunkId: string; score: number; content: string; documentId: string; title: string };
