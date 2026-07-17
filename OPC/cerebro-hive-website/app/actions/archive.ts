'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type DocumentDTO = {
  id: string;
  title: string;
  status: 'uploaded' | 'scanning' | 'parsing' | 'chunking' | 'embedding' | 'indexed' | 'failed';
  size_bytes?: number;
  created_at?: string;
};

export type ListDocumentsResult = {
  documents: DocumentDTO[];
  total: number;
  page: number;
  page_size: number;
};

export type DashboardStats = {
  total: number;
  indexed: number;
  processing: number;
  failed: number;
};

/**
 * Fetches a paginated list of documents for the authenticated workspace.
 */
export async function listDocuments(
  page = 1,
  pageSize = 20,
  workspaceId = 'default-workspace',
): Promise<{ data?: ListDocumentsResult; error?: string }> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      workspace_id: workspaceId,
    });

    const res = await fetch(`${API_URL}/archive/documents?${params}`, {
      headers: await authHeaders(),
      cache: 'no-store', // always fresh for document management
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.error?.message || 'Failed to fetch documents.' };
    }
    return { data: json.data };
  } catch (err) {
    console.error('listDocuments error:', err);
    return { error: 'Could not connect to the archive service.' };
  }
}

/**
 * Uploads a document file to the archive via multipart form.
 */
export async function uploadDocument(
  formData: FormData,
): Promise<{ data?: DocumentDTO; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const res = await fetch(`${API_URL}/archive/documents`, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type here — browser/node sets it with boundary for multipart
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.error?.message || 'Upload failed.' };
    }
    return { data: json.data };
  } catch (err) {
    console.error('uploadDocument error:', err);
    return { error: 'Could not upload document. Check your connection.' };
  }
}

/**
 * Fetches live document stats for the dashboard overview.
 */
export async function getDashboardStats(
  workspaceId = 'default-workspace',
): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    const res = await fetch(`${API_URL}/archive/dashboard/stats?${params}`, {
      headers: await authHeaders(),
      next: { revalidate: 30 }, // revalidate every 30s — near real-time metrics
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.error?.message || 'Failed to fetch stats.' };
    }
    return { data: json.data };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return { error: 'Could not fetch dashboard stats.' };
  }
}

/**
 * Fetches the N most recent documents for the dashboard overview.
 */
export async function getRecentDocuments(
  limit = 5,
  workspaceId = 'default-workspace',
): Promise<{ data?: DocumentDTO[]; error?: string }> {
  const result = await listDocuments(1, limit, workspaceId);
  if (result.error) return { error: result.error };
  return { data: result.data?.documents };
}
