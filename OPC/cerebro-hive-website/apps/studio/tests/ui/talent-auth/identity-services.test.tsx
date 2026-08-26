import { decodeJwt, SignJWT } from 'jose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    findUnique: vi.fn(),
  },
  workspace: {
    findMany: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('bcryptjs', () => ({ default: bcryptMock, ...bcryptMock }));

import { AuthService } from '../../../lib/services/auth.service';
import { PlatformService } from '../../../lib/services/platform.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const TENANT_ID = '22222222-2222-4222-8222-222222222222';
const ROLE_ID = '33333333-3333-4333-8333-333333333333';
const WORKSPACE_ID = '44444444-4444-4444-8444-444444444444';
const PROJECT_ID = '55555555-5555-4555-8555-555555555555';
const JWT_SECRET = 'a-secure-studio-secret-with-32-bytes';
const PASSWORD_HASH = '$2b$12$credential-material-that-must-not-leak';

function createTransactionClient() {
  return {
    user: {
      create: vi.fn().mockResolvedValue({ id: USER_ID }),
    },
    tenant: {
      create: vi.fn().mockResolvedValue({ id: TENANT_ID }),
    },
    role: {
      findUnique: vi.fn().mockResolvedValue({ id: ROLE_ID }),
    },
    tenantMember: {
      create: vi.fn().mockResolvedValue({ id: 'member-id' }),
    },
    workspace: {
      create: vi.fn().mockResolvedValue({ id: WORKSPACE_ID }),
    },
    project: {
      create: vi.fn().mockResolvedValue({ id: PROJECT_ID }),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit-id' }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STUDIO_JWT_SECRET = JWT_SECRET;
  bcryptMock.hash.mockResolvedValue(PASSWORD_HASH);
  bcryptMock.compare.mockResolvedValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Studio access-token contract', () => {
  it('rejects a missing or sub-32-byte Studio secret while accepting 32 encoded bytes', async () => {
    delete process.env.STUDIO_JWT_SECRET;
    await expect(AuthService.generateToken(USER_ID)).rejects.toThrow(/STUDIO_JWT_SECRET/);

    process.env.STUDIO_JWT_SECRET = 'x'.repeat(31);
    await expect(AuthService.generateToken(USER_ID)).rejects.toThrow(/32 bytes/);

    process.env.STUDIO_JWT_SECRET = '🔐'.repeat(8);
    await expect(AuthService.generateToken(USER_ID)).resolves.toEqual(expect.any(String));
  });

  it('mints and verifies only the exact one-hour global identity claim set', async () => {
    const token = await AuthService.generateToken(USER_ID);
    const payload = decodeJwt(token);

    expect(Object.keys(payload).sort()).toEqual(['aud', 'exp', 'iat', 'iss', 'jti', 'sub']);
    expect(payload).toMatchObject({
      aud: 'cerebro-studio-api',
      iss: 'cerebro-studio',
      sub: USER_ID,
    });
    expect(payload.jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(Number(payload.exp) - Number(payload.iat)).toBe(60 * 60);
    await expect(AuthService.verifyToken(token)).resolves.toEqual({ userId: USER_ID });
  });

  it('rejects extra authorization claims, malformed subjects, and non-HS256 tokens', async () => {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const baseToken = () =>
      new SignJWT({ tenantId: TENANT_ID })
        .setIssuer('cerebro-studio')
        .setAudience('cerebro-studio-api')
        .setIssuedAt(now)
        .setExpirationTime(now + 60 * 60)
        .setJti('66666666-6666-4666-8666-666666666666');

    const extraClaim = await baseToken()
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(USER_ID)
      .sign(secret);
    const malformedSubject = await baseToken()
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('not-a-user-id')
      .sign(secret);
    const wrongAlgorithm = await baseToken()
      .setProtectedHeader({ alg: 'HS384' })
      .setSubject(USER_ID)
      .sign(secret);

    await expect(AuthService.verifyToken(extraClaim)).resolves.toBeNull();
    await expect(AuthService.verifyToken(malformedSubject)).resolves.toBeNull();
    await expect(AuthService.verifyToken(wrongAlgorithm)).resolves.toBeNull();
  });
});

describe('credential authentication', () => {
  it('uses one generic failure and a bcrypt comparison for absent and wrong credentials', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: USER_ID,
        email: 'person@example.com',
        name: 'Person',
        avatarUrl: null,
        createdAt: new Date('2026-08-23T00:00:00.000Z'),
        updatedAt: new Date('2026-08-23T00:00:00.000Z'),
        passwordCredential: { passwordHash: PASSWORD_HASH },
      });
    bcryptMock.compare.mockResolvedValue(false);

    const absent = AuthService.login(' Person@Example.com ', 'incorrect-password');
    const wrong = AuthService.login('person@example.com', 'incorrect-password');

    await expect(absent).rejects.toThrow('Invalid credentials.');
    await expect(wrong).rejects.toThrow('Invalid credentials.');
    expect(bcryptMock.compare).toHaveBeenCalledTimes(2);
    expect(bcryptMock.compare.mock.calls[0]?.[1]).toEqual(expect.any(String));
    expect(bcryptMock.compare.mock.calls[1]?.[1]).toBe(PASSWORD_HASH);
    expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { email: 'person@example.com' } })
    );
  });

  it('returns only a strict token and never places the password hash in the result or logs', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'person@example.com',
      name: 'Person',
      avatarUrl: null,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
      passwordCredential: { passwordHash: PASSWORD_HASH },
    });
    bcryptMock.compare.mockResolvedValue(true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const token = await AuthService.login('person@example.com', 'correct-password');

    expect(typeof token).toBe('string');
    expect(JSON.stringify(decodeJwt(token))).not.toContain(PASSWORD_HASH);
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});

describe('transactional identity provisioning', () => {
  it('hashes before one transaction and rolls back the full surface when its audit write fails', async () => {
    const events: string[] = [];
    const tx = createTransactionClient();
    bcryptMock.hash.mockImplementation(async () => {
      events.push('hash');
      return PASSWORD_HASH;
    });
    tx.auditLog.create.mockImplementation(async () => {
      events.push('audit');
      throw new Error('audit unavailable');
    });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      events.push('transaction');
      return callback(tx);
    });
    const generateToken = vi.spyOn(AuthService, 'generateToken');

    await expect(
      AuthService.register(' New.Person@Example.com ', 'a-valid-password', ' New Person ')
    ).rejects.toThrow('audit unavailable');

    expect(events).toEqual(['hash', 'transaction', 'audit']);
    expect(bcryptMock.hash).toHaveBeenCalledWith('a-valid-password', 12);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        email: 'new.person@example.com',
        name: 'New Person',
        passwordCredential: { create: { passwordHash: PASSWORD_HASH } },
      },
      select: { id: true },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'identity:register',
        resource: 'tenant',
        resourceId: TENANT_ID,
        userId: USER_ID,
        workspaceId: WORKSPACE_ID,
      },
    });
    expect(generateToken).not.toHaveBeenCalled();
  });

  it('mints the token only after the provisioning transaction commits', async () => {
    const tx = createTransactionClient();
    const generateToken = vi
      .spyOn(AuthService, 'generateToken')
      .mockResolvedValue('committed-token');
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const result = await callback(tx);
      expect(generateToken).not.toHaveBeenCalled();
      return result;
    });

    await expect(
      AuthService.register('new.person@example.com', 'a-valid-password', 'New Person')
    ).resolves.toBe('committed-token');
    expect(generateToken).toHaveBeenCalledWith(USER_ID);
  });

  it('returns the same generic registration failure for a unique-email race', async () => {
    const uniqueConstraint = Object.assign(new Error('Unique constraint failed on email'), {
      code: 'P2002',
      meta: { target: ['email'] },
    });
    prismaMock.$transaction.mockRejectedValue(uniqueConstraint);

    await expect(
      AuthService.register('person@example.com', 'a-valid-password', 'Person')
    ).rejects.toThrow('Registration failed.');
  });
});

describe('membership-scoped platform reads', () => {
  it('lists only workspaces whose tenant contains the verified member', async () => {
    const workspaces = [{ id: WORKSPACE_ID, tenantId: TENANT_ID, name: 'General' }];
    prismaMock.workspace.findMany.mockResolvedValue(workspaces);

    await expect(PlatformService.getWorkspaces(USER_ID)).resolves.toBe(workspaces);
    expect(prismaMock.workspace.findMany).toHaveBeenCalledWith({
      where: { tenant: { members: { some: { userId: USER_ID } } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('scopes project reads to both the selected workspace and its verified tenant member', async () => {
    const projects = [{ id: PROJECT_ID, workspaceId: WORKSPACE_ID, name: 'Default Project' }];
    prismaMock.project.findMany.mockResolvedValue(projects);

    await expect(PlatformService.getProjects(USER_ID, WORKSPACE_ID)).resolves.toBe(projects);
    expect(prismaMock.project.findMany).toHaveBeenCalledWith({
      where: {
        workspaceId: WORKSPACE_ID,
        workspace: { tenant: { members: { some: { userId: USER_ID } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
// @vitest-environment node
