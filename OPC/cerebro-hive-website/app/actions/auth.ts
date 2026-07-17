'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function authenticate(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    // Proxy request to Go API
    const res = await fetch(`${API_URL}/identity/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.error?.message || 'Invalid credentials.' };
    }

    // Set secure HttpOnly cookie with the access token returned by Go
    const cookieStore = await cookies();
    cookieStore.set('access_token', data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return { success: true };

    
  } catch (error) {
    console.error('Authentication Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('fullName');

  if (!email || !password || !fullName) {
    return { error: 'All fields are required.' };
  }

  if (password.toString().length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  try {
    // Proxy request to Go API
    const res = await fetch(`${API_URL}/identity/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error?.message || 'Registration failed.' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
