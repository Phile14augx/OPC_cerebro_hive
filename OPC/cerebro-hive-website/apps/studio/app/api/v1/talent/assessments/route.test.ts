// @vitest-environment node

import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/services/auth.service', () => ({ AuthService: {} }));
vi.mock('@cerebro/db', () => ({ TALENT_PERMISSION_TUPLES: [], TalentAuthorizationRepository: { fromPrisma: vi.fn() } }));

import { GET, POST } from './route';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';

vi.mock('../../../../../lib/talent/auth/middleware', () => ({
  withAuthorization: vi.fn(),
}));

vi.mock('../../../../../lib/talent/services/AssessmentService', () => {
  return {
    AssessmentService: vi.fn().mockImplementation(() => ({
      listAssessments: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      createDraft: vi.fn().mockResolvedValue({ id: 'new-assessment-123' }),
    })),
  };
});

describe('Assessments API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET should extract x-workspace-id from headers and pass as target', async () => {
    const req = new NextRequest('http://localhost/api/v1/talent/assessments?skip=0&take=10', {
      headers: {
        'x-workspace-id': 'workspace-123',
      },
    });

    await GET(req);

    expect(withAuthorization).toHaveBeenCalledWith(
      req,
      'READ_ASSESSMENT',
      'talent_assessments',
      expect.any(Function),
      { resourceType: 'workspace', resourceId: 'workspace-123' }
    );
  });

  it('POST should extract x-workspace-id from headers and pass as target', async () => {
    const req = new NextRequest('http://localhost/api/v1/talent/assessments', {
      method: 'POST',
      headers: {
        'x-workspace-id': 'workspace-456',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'New Assessment' }),
    });

    await POST(req);

    expect(withAuthorization).toHaveBeenCalledWith(
      req,
      'CREATE_ASSESSMENT',
      'talent_assessments',
      expect.any(Function),
      { resourceType: 'workspace', resourceId: 'workspace-456' }
    );
  });
});
