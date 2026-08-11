'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export type Citation = {
  document_id: string;
  source: string;
  text: string;
  score: number;
};

export type ChatResponse = {
  answer: string;
  citations: Citation[];
};

export async function askAI(query: string): Promise<{ data?: ChatResponse; error?: string }> {
  if (!query || query.trim() === '') {
    return { error: 'Query cannot be empty.' };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error?.message || 'Failed to get response.' };
    }
    return { data: data.data };
  } catch (error) {
    console.error('AI Request Error:', error);
    return { error: 'An unexpected error occurred while communicating with the AI Service.' };
  }
}
