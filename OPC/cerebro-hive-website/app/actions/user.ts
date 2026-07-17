'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
};

/**
 * Fetches the current authenticated user's profile from the Go /me endpoint.
 * Uses the HttpOnly access_token cookie — never exposes the token to the browser.
 */
export async function getMe(): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return { error: 'Not authenticated' };

    const res = await fetch(`${API_URL}/identity/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok) {
      return { error: json.error?.message || 'Could not fetch profile.' };
    }
    return { data: json.data };
  } catch (err) {
    console.error('getMe error:', err);
    return { error: 'Could not connect to identity service.' };
  }
}
