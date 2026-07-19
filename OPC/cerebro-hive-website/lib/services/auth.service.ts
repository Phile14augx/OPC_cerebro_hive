import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { PlatformService } from './platform.service';
import { AuditService } from './audit.service';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'development_secret_do_not_use_in_production'
);

export class AuthService {
  /**
   * Register a new user, create their tenant, and return a JWT access token.
   */
  static async register(email: string, passwordRaw: string, fullName: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: fullName,
      },
    });

    // Enterprise Initialization (Org, Workspace, Project, Role)
    await PlatformService.initializeTenant(user.id, fullName || email.split('@')[0]);

    await AuditService.log('USER_REGISTERED', `user:${user.id}`, user.id);

    return this.generateToken(user.id);
  }

  /**
   * Authenticate a user and return a JWT access token.
   */
  static async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await AuditService.log('LOGIN_FAILED', `user_email:${email}`);
      throw new Error('Invalid credentials.');
    }

    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) {
      await AuditService.log('LOGIN_FAILED', `user:${user.id}`, user.id);
      throw new Error('Invalid credentials.');
    }

    await AuditService.log('USER_LOGGED_IN', `user:${user.id}`, user.id);

    return this.generateToken(user.id);
  }

  /**
   * Sign a stateless JWT for edge-compatible session management.
   */
  static async generateToken(userId: string) {
    return new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Short-lived access token
      .sign(JWT_SECRET);
  }

  /**
   * Verify a JWT token and extract the payload.
   */
  static async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as { userId: string };
    } catch (err) {
      return null;
    }
  }
}
