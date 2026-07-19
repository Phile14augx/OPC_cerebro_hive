'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/auth.service';
import { prisma } from '@/lib/prisma';

export async function authenticate(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    const token = await AuthService.login(email, password);

    // Set secure HttpOnly cookie with the access token
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return { success: true };
    
  } catch (error: any) {
    console.error('Authentication Error:', error);
    return { error: error.message || 'Invalid credentials. Please try again.' };
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const fullName = formData.get('fullName')?.toString();

  if (!email || !password || !fullName) {
    return { error: 'All fields are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  try {
    const token = await AuthService.register(email, password, fullName);
    
    // Auto-login after registration
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Registration Error:', error);
    return { error: error.message || 'Registration failed. Please try again.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
}

export async function getLocalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  if (!token) return null;
  
  try {
    const payload = await AuthService.verifyToken(token.value);
    if (!payload || !payload.userId) return null;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { organizationId: true }
    });
    
    return { 
      userId: payload.userId, 
      organizationId: user?.organizationId || '' 
    };
  } catch (err) {
    return null;
  }
}