// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

const authServiceMock = vi.hoisted(() => ({
  generateToken: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  validateRegistrationInput: vi.fn(),
  verifyToken: vi.fn(),
}));

const platformServiceMock = vi.hoisted(() => ({
  getProjects: vi.fn(),
  getWorkspaces: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock('../../../lib/services/auth.service', () => ({
  AuthService: authServiceMock,
  STUDIO_ACCESS_TOKEN_TTL_SECONDS: 60 * 60,
}));
vi.mock('../../../lib/services/platform.service', () => ({
  PlatformService: platformServiceMock,
}));
vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));

import {
  authenticate,
  getLocalSession,
  register as registerAction,
} from '../../../app/actions/auth';
import { getProjects, getWorkspaces } from '../../../app/actions/platform';
import { getMe } from '../../../app/actions/user';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = '44444444-4444-4444-8444-444444444444';

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue({ value: 'verified-token' });
  authServiceMock.verifyToken.mockResolvedValue({ userId: USER_ID });
  authServiceMock.login.mockResolvedValue('login-token');
  authServiceMock.register.mockResolvedValue('registration-token');
  authServiceMock.validateRegistrationInput.mockImplementation((email, password, fullName) => ({
    email: email.trim().toLowerCase(),
    password,
    fullName: fullName.trim(),
  }));
});

describe('authentication actions', () => {
  it('rejects malformed login form data before calling the credential service', async () => {
    await expect(
      authenticate(form({ email: 'not-an-email', password: 'a-valid-password' }))
    ).resolves.toEqual({ error: 'Please enter a valid email and password.' });
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('normalizes login identity and matches the cookie lifetime to the token lifetime', async () => {
    await expect(
      authenticate(form({ email: ' Person@Example.com ', password: 'a-valid-password' }))
    ).resolves.toEqual({ success: true });

    expect(authServiceMock.login).toHaveBeenCalledWith('person@example.com', 'a-valid-password');
    expect(cookieStore.set).toHaveBeenCalledWith(
      'access_token',
      'login-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
      })
    );
  });

  it('uses validated normalized registration input and the same one-hour cookie contract', async () => {
    await expect(
      registerAction(
        form({
          email: ' New.Person@Example.com ',
          password: 'a-valid-password',
          fullName: ' New Person ',
        })
      )
    ).resolves.toEqual({ success: true });

    expect(authServiceMock.validateRegistrationInput).toHaveBeenCalledWith(
      ' New.Person@Example.com ',
      'a-valid-password',
      ' New Person '
    );
    expect(authServiceMock.register).toHaveBeenCalledWith(
      'new.person@example.com',
      'a-valid-password',
      'New Person'
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'access_token',
      'registration-token',
      expect.objectContaining({ maxAge: 60 * 60 })
    );
  });

  it('returns only the verified global user identity from the local session', async () => {
    await expect(getLocalSession()).resolves.toEqual({ userId: USER_ID });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe('current-user action', () => {
  it('returns global profile fields without first-membership role or organization aliases', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'person@example.com',
      name: 'Person',
    });

    await expect(getMe()).resolves.toEqual({
      data: {
        id: USER_ID,
        email: 'person@example.com',
        full_name: 'Person',
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: USER_ID },
      select: { id: true, email: true, name: true },
    });
  });
});

describe('membership-scoped platform actions', () => {
  it('passes only the verified user identity to workspace listing', async () => {
    const workspaces = [{ id: WORKSPACE_ID, name: 'General Workspace' }];
    platformServiceMock.getWorkspaces.mockResolvedValue(workspaces);

    await expect(getWorkspaces()).resolves.toEqual({ data: workspaces });
    expect(platformServiceMock.getWorkspaces).toHaveBeenCalledWith(USER_ID);
  });

  it('validates the caller workspace selector and scopes project reads with verified user identity', async () => {
    await expect(getProjects('not-a-workspace-id')).resolves.toEqual({
      error: 'Invalid workspace.',
    });
    expect(platformServiceMock.getProjects).not.toHaveBeenCalled();

    const projects = [{ id: '55555555-5555-4555-8555-555555555555', name: 'Default Project' }];
    platformServiceMock.getProjects.mockResolvedValue(projects);
    await expect(getProjects(WORKSPACE_ID)).resolves.toEqual({ data: projects });
    expect(platformServiceMock.getProjects).toHaveBeenCalledWith(USER_ID, WORKSPACE_ID);
  });
});
