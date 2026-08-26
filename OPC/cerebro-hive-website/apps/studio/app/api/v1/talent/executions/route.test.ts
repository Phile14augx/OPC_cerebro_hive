// @vitest-environment node

import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/services/auth.service', () => ({ AuthService: {} }));
vi.mock('@cerebro/db', () => ({ TALENT_PERMISSION_TUPLES: [], TalentAuthorizationRepository: { fromPrisma: vi.fn() } }));

import { POST } from './route';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';


vi.mock('../../../../../lib/talent/auth/middleware', () => ({
  withAuthorization: vi.fn(),
}));

vi.mock('../../../../../lib/talent/infrastructure/execution/ExecutionService', () => {
  return {
    ExecutionService: vi.fn().mockImplementation(() => ({
      submitExecution: vi.fn().mockResolvedValue({ id: 'job-123' }),
    })),
  };
});

describe('Executions API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST should extract sessionId from body and pass as target to CREATE_EXECUTION', async () => {
    const req = new NextRequest('http://localhost/api/v1/talent/executions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: 'session-789', language: 'python', code: 'print("hello")' }),
    });

    await POST(req);

    expect(withAuthorization).toHaveBeenCalledWith(
      req,
      'CREATE_EXECUTION',
      'talent_executions',
      expect.any(Function),
      { resourceType: 'session', resourceId: 'session-789' }
    );
  });
});
