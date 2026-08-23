import assert from 'node:assert/strict';
import test from 'node:test';
import {
  TALENT_PERMISSION_TUPLES,
  TALENT_PERMISSIONS_BY_ROLE,
  TALENT_ROLE_KEYS,
} from '../auth/talent-permissions';
import {
  TalentAuthorizationRepository,
  type TalentAuthorizationClient,
} from './TalentAuthorizationRepository';

const workspaceId = '11111111-1111-4111-8111-111111111111';
const otherWorkspaceId = '22222222-2222-4222-8222-222222222222';
const tenantId = '33333333-3333-4333-8333-333333333333';
const projectId = '44444444-4444-4444-8444-444444444444';
const assessmentVersionId = '55555555-5555-4555-8555-555555555555';
const sessionId = '66666666-6666-4666-8666-666666666666';
const candidateUserId = '77777777-7777-4777-8777-777777777777';

function createClient(): TalentAuthorizationClient {
  return {
    workspace: {
      async findUnique(args) {
        return args.where.id === workspaceId
          ? { id: workspaceId, tenantId }
          : null;
      },
    },
    project: {
      async findFirst(args) {
        return args.where.id === projectId && args.where.workspaceId === workspaceId
          ? { id: projectId, workspaceId, workspace: { tenantId } }
          : null;
      },
    },
    assessmentVersion: {
      async findFirst(args) {
        return args.where.id === assessmentVersionId &&
          args.where.assessment.workspaceId === workspaceId
          ? {
              id: assessmentVersionId,
              assessment: { workspaceId, workspace: { tenantId } },
            }
          : null;
      },
    },
    assessmentSession: {
      async findFirst(args) {
        return args.where.id === sessionId &&
          args.where.assessmentVersion.assessment.workspaceId === workspaceId
          ? {
              id: sessionId,
              candidate: { userId: candidateUserId },
              assessmentVersion: {
                assessment: { workspaceId, workspace: { tenantId } },
              },
            }
          : null;
      },
    },
  };
}

test('Talent roles expose the exact immutable canonical keys', () => {
  assert.deepEqual(TALENT_ROLE_KEYS, {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    RECRUITER: 'RECRUITER',
    CANDIDATE: 'CANDIDATE',
  });
});

test('Talent permissions expose exact non-wildcard tuples and serialized values', () => {
  assert.deepEqual(
    TALENT_PERMISSION_TUPLES.map(({ key, resource, action, serialized }) => ({
      key,
      resource,
      action,
      serialized,
    })),
    [
      { key: 'READ_ASSESSMENT', resource: 'talent_assessments', action: 'read', serialized: 'talent_assessments:read' },
      { key: 'CREATE_ASSESSMENT', resource: 'talent_assessments', action: 'create', serialized: 'talent_assessments:create' },
      { key: 'READ_COPILOT_INSIGHTS', resource: 'talent_copilot', action: 'read', serialized: 'talent_copilot:read' },
      { key: 'CREATE_SESSION', resource: 'talent_sessions', action: 'create', serialized: 'talent_sessions:create' },
      { key: 'SUBMIT_SESSION', resource: 'talent_sessions', action: 'submit', serialized: 'talent_sessions:submit' },
      { key: 'UPDATE_SESSION', resource: 'talent_session_telemetry', action: 'write', serialized: 'talent_session_telemetry:write' },
      { key: 'CREATE_EXECUTION', resource: 'talent_executions', action: 'create', serialized: 'talent_executions:create' },
    ],
  );

  assert.equal(new Set(TALENT_PERMISSION_TUPLES.map(({ serialized }) => serialized)).size, 7);
  assert.equal(
    TALENT_PERMISSION_TUPLES.some(({ serialized }) => serialized.includes('*')),
    false,
  );
});

test('Talent role grants match the binding least-privilege matrix', () => {
  const serializedByRole = Object.fromEntries(
    Object.entries(TALENT_PERMISSIONS_BY_ROLE).map(([role, permissions]) => [
      role,
      permissions.map(({ serialized }) => serialized),
    ]),
  );

  assert.deepEqual(serializedByRole, {
    OWNER: [
      'talent_assessments:read',
      'talent_assessments:create',
      'talent_copilot:read',
      'talent_sessions:create',
      'talent_sessions:submit',
      'talent_session_telemetry:write',
      'talent_executions:create',
    ],
    ADMIN: [
      'talent_assessments:read',
      'talent_assessments:create',
      'talent_copilot:read',
      'talent_sessions:create',
      'talent_sessions:submit',
      'talent_session_telemetry:write',
      'talent_executions:create',
    ],
    RECRUITER: [
      'talent_assessments:read',
      'talent_assessments:create',
      'talent_copilot:read',
    ],
    CANDIDATE: [
      'talent_sessions:create',
      'talent_sessions:submit',
      'talent_session_telemetry:write',
      'talent_executions:create',
    ],
  });
});

test('workspace target derives its tenant without a caller-supplied tenant id', async () => {
  const repository = new TalentAuthorizationRepository(createClient());

  assert.deepEqual(await repository.resolveWorkspaceTarget(workspaceId), {
    resourceType: 'workspace',
    resourceId: workspaceId,
    workspaceId,
    tenantId,
    ownerUserId: null,
  });
});

test('project target is unresolved when its authoritative workspace differs from the selector', async () => {
  const repository = new TalentAuthorizationRepository(createClient());

  assert.deepEqual(await repository.resolveProjectTarget(projectId, workspaceId), {
    resourceType: 'project',
    resourceId: projectId,
    workspaceId,
    tenantId,
    ownerUserId: null,
  });
  assert.equal(await repository.resolveProjectTarget(projectId, otherWorkspaceId), null);
});

test('assessment version target derives workspace and tenant through the assessment relation', async () => {
  const repository = new TalentAuthorizationRepository(createClient());

  assert.deepEqual(
    await repository.resolveAssessmentVersionTarget(assessmentVersionId, workspaceId),
    {
      resourceType: 'assessment_version',
      resourceId: assessmentVersionId,
      workspaceId,
      tenantId,
      ownerUserId: null,
    },
  );
  assert.equal(
    await repository.resolveAssessmentVersionTarget(assessmentVersionId, otherWorkspaceId),
    null,
  );
});

test('session target derives candidate ownership and rejects a different workspace selector', async () => {
  const repository = new TalentAuthorizationRepository(createClient());

  assert.deepEqual(await repository.resolveSessionTarget(sessionId, workspaceId), {
    resourceType: 'session',
    resourceId: sessionId,
    workspaceId,
    tenantId,
    ownerUserId: candidateUserId,
  });
  assert.equal(await repository.resolveSessionTarget(sessionId, otherWorkspaceId), null);
});
