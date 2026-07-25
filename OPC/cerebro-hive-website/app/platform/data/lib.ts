export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) }); return true; }
  catch { return false; }
}

export type ArchiveDoc = {
  id: string;
  title: string;
  description?: string;
  domain: string;
  resource_type?: string;
  tags?: string[];
  is_public: boolean;
  version: number;
  file_path?: string;
  file_type?: string;
  file_size_bytes?: number;
  created_at: string;
  updated_at?: string;
};

export type DocList = {
  items: ArchiveDoc[];
  total: number;
  page: number;
  page_size: number;
};
