'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  AuthService,
  STUDIO_ACCESS_TOKEN_TTL_SECONDS,
} from '@/lib/services/auth.service';

const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(256),
});

async function setAccessTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: STUDIO_ACCESS_TOKEN_TTL_SECONDS,
  });
}

export async function authenticate(formData: FormData) {
  const parsed = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Please enter a valid email and password.' };
  }

  try {
    const token = await AuthService.login(parsed.data.email, parsed.data.password);
    await setAccessTokenCookie(token);
    return { success: true };
  } catch {
    return { error: 'Invalid credentials.' };
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('fullName');

  if (typeof email !== 'string' || typeof password !== 'string' || typeof fullName !== 'string') {
    return { error: 'All fields are required.' };
  }

  let registration;
  try {
    registration = AuthService.validateRegistrationInput(email, password, fullName);
  } catch {
    return { error: 'Please provide a valid email, name, and password of at least 8 characters.' };
  }

  try {
    const token = await AuthService.register(
      registration.email,
      registration.password,
      registration.fullName
    );
    await setAccessTokenCookie(token);
    return { success: true };
  } catch {
    return { error: 'Registration failed.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
}

export async function getLocalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    return await AuthService.verifyToken(token);
  } catch {
    return null;
  }
}
