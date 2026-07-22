'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/auth.service';
import { prisma } from '@/lib/prisma';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organizationId?: string | null;
};

/**
 * Fetches the current authenticated user's profile from the database using the JWT cookie.
 */
export async function getMe(): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return { error: 'Not authenticated' };

    const payload = await AuthService.verifyToken(token);
    if (!payload || !payload.userId) {
      return { error: 'Invalid or expired session.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      }
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    return { 
      data: {
        id: user.id,
        email: user.email,
        full_name: user.name || '',
        role: user.role,
        organizationId: user.organizationId,
      } 
    };
  } catch (err) {
    console.error('getMe error:', err);
    return { error: 'Could not fetch user profile.' };
  }
}
