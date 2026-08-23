import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PlatformService } from './platform.service';

const STUDIO_JWT_ISSUER = 'cerebro-studio';
const STUDIO_JWT_AUDIENCE = 'cerebro-studio-api';
export const STUDIO_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

const DUMMY_PASSWORD_HASH = '$2b$12$JbXBD1IysnOFs4wf5lFBfeTmVjt94nByqyDlzvpS8dZb5.3yoAOqO';
const EXPECTED_CLAIM_KEYS = ['aud', 'exp', 'iat', 'iss', 'jti', 'sub'] as const;

const registrationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(256),
    fullName: z.string().trim().min(1).max(200),
  })
  .strict();

const emailSchema = z.string().trim().toLowerCase().email();
const uuidSchema = z.string().uuid();

function studioJwtSecret(): Uint8Array {
  const configured = process.env.STUDIO_JWT_SECRET;
  if (!configured) {
    throw new Error('STUDIO_JWT_SECRET is required.');
  }

  const encoded = new TextEncoder().encode(configured);
  if (encoded.byteLength < 32) {
    throw new Error('STUDIO_JWT_SECRET must contain at least 32 bytes.');
  }

  return encoded;
}

function hasExactAccessClaims(payload: JWTPayload): payload is JWTPayload & {
  sub: string;
  iss: typeof STUDIO_JWT_ISSUER;
  aud: typeof STUDIO_JWT_AUDIENCE;
  iat: number;
  exp: number;
  jti: string;
} {
  const keys = Object.keys(payload).sort();
  if (
    keys.length !== EXPECTED_CLAIM_KEYS.length ||
    !EXPECTED_CLAIM_KEYS.every((key, index) => keys[index] === key)
  ) {
    return false;
  }

  return (
    payload.iss === STUDIO_JWT_ISSUER &&
    payload.aud === STUDIO_JWT_AUDIENCE &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    payload.exp - payload.iat === STUDIO_ACCESS_TOKEN_TTL_SECONDS &&
    typeof payload.sub === 'string' &&
    uuidSchema.safeParse(payload.sub).success &&
    typeof payload.jti === 'string' &&
    uuidSchema.safeParse(payload.jti).success
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

export interface RegistrationInput {
  email: string;
  password: string;
  fullName: string;
}

export class AuthService {
  static validateRegistrationInput(
    email: string,
    password: string,
    fullName: string
  ): RegistrationInput {
    return registrationSchema.parse({ email, password, fullName });
  }

  static async register(email: string, passwordRaw: string, fullName: string): Promise<string> {
    const registration = this.validateRegistrationInput(email, passwordRaw, fullName);
    const passwordHash = await bcrypt.hash(registration.password, 12);

    let userId: string;
    try {
      userId = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: registration.email,
            name: registration.fullName,
            passwordCredential: {
              create: { passwordHash },
            },
          },
          select: { id: true },
        });

        await PlatformService.provisionInitialTenant(tx, user.id, registration.fullName);
        return user.id;
      });
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new Error('Registration failed.');
      }
      throw error;
    }

    return this.generateToken(userId);
  }

  static async login(email: string, passwordRaw: string): Promise<string> {
    const normalizedEmail = emailSchema.safeParse(email);
    const user = normalizedEmail.success
      ? await prisma.user.findUnique({
          where: { email: normalizedEmail.data },
          select: {
            id: true,
            passwordCredential: {
              select: { passwordHash: true },
            },
          },
        })
      : null;

    const passwordHash = user?.passwordCredential?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(passwordRaw, passwordHash);
    if (!user?.passwordCredential || !passwordMatches) {
      throw new Error('Invalid credentials.');
    }

    return this.generateToken(user.id);
  }

  static async generateToken(userId: string): Promise<string> {
    if (!uuidSchema.safeParse(userId).success) {
      throw new Error('Cannot mint a Studio token for an invalid user identity.');
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    return new SignJWT()
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuer(STUDIO_JWT_ISSUER)
      .setAudience(STUDIO_JWT_AUDIENCE)
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + STUDIO_ACCESS_TOKEN_TTL_SECONDS)
      .setJti(randomUUID())
      .sign(studioJwtSecret());
  }

  static async verifyToken(token: string): Promise<{ userId: string } | null> {
    const secret = studioJwtSecret();
    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: STUDIO_JWT_ISSUER,
        audience: STUDIO_JWT_AUDIENCE,
      });
      if (!hasExactAccessClaims(payload)) {
        return null;
      }

      return { userId: payload.sub };
    } catch {
      return null;
    }
  }
}
