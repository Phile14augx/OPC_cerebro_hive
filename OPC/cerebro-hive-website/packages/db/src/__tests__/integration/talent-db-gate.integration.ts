/**
 * Talent DB Verification Gate — Integration Exercise Script
 * Phases 6 & 7 of the W0.2 Recovery Gate
 *
 * Run with:
 *   $env:DATABASE_URL = "postgresql://gateuser:gatepass@localhost:5450/cerebro_gate"
 *   pnpm exec tsx gate-integration.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client';
import { TalentAuthorizationRepository } from '../../repositories/TalentAuthorizationRepository';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0;
const failures: string[] = [];

function check(label: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`[PASS] ${label}`);
    passed++;
  } else {
    const msg = `[FAIL] ${label}${detail ? ': ' + detail : ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

async function rejectsWithPattern(fn: () => Promise<unknown>, pattern: RegExp): Promise<boolean> {
  try { await fn(); return false; }
  catch (err: any) { return pattern.test(String(err?.message ?? err)); }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const ts = Date.now();

  try {
    // ── FIXTURE SETUP ────────────────────────────────────────────────────────

    console.log('\n=== Gate Integration: Fixture Setup ===\n');

    const tenant = await prisma.tenant.create({
      data: { name: 'GateTenant', slug: `gate-t-${ts}` },
    });
    const workspace = await prisma.workspace.create({
      data: { tenantId: tenant.id, name: 'GateWS', slug: `gate-ws-${ts}` },
    });
    const userA = await prisma.user.create({
      data: { email: `gate-a-${ts}@test.local` },
    });
    const candidateA = await prisma.candidateProfile.create({
      data: { userId: userA.id },
    });
    const assessment = await prisma.assessment.create({
      data: { workspaceId: workspace.id, title: 'Gate Assessment', tags: [] },
    });
    const version = await prisma.assessmentVersion.create({
      data: {
        assessmentId: assessment.id,
        versionNumber: 1,
        manifestHash: `gate-hash-${ts}`,
        schemaPayload: { version: 1, steps: ['code'] },
        manifestPayload: { duration: 90, language: 'typescript' },
      },
    });
    const session = await prisma.assessmentSession.create({
      data: { candidateId: candidateA.id, assessmentVersionId: version.id },
    });

    console.log(`  tenant=${tenant.id}`);
    console.log(`  workspace=${workspace.id}`);
    console.log(`  userA=${userA.id}, candidateA=${candidateA.id}`);
    console.log(`  assessment=${assessment.id}, version=${version.id}`);
    console.log(`  session=${session.id}`);

    // ── PHASE 6A: Workspace resolution chain + SUBMITTED enum ────────────────

    console.log('\n=== Phase 6A: Workspace Resolution Chain + SUBMITTED enum ===\n');

    const fetchedForSubmit = await prisma.assessmentSession.findUnique({
      where: { id: session.id },
      include: {
        assessmentVersion: {
          include: { assessment: { select: { workspaceId: true } } },
        },
      },
    });
    check('6A: session fetched', fetchedForSubmit !== null);
    check(
      '6A: assessmentVersion.assessment.workspaceId resolves to workspace.id',
      fetchedForSubmit?.assessmentVersion.assessment.workspaceId === workspace.id,
    );

    const submitted = await prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        status: 'SUBMITTED',
        metrics: { passed: 3, total: 4, executionTimeMs: 1234 },
      },
    });
    check('6A: status persists as SUBMITTED (not COMPLETED)', submitted.status === 'SUBMITTED');
    check('6A: metrics JSON round-trips (passed=3)', (submitted.metrics as any)?.passed === 3);
    check('6A: metrics JSON round-trips (executionTimeMs=1234)', (submitted.metrics as any)?.executionTimeMs === 1234);

    // ── PHASE 6B: TelemetryService sequence, JSON, uniqueness ────────────────

    console.log('\n=== Phase 6B: TelemetryService Sequence + JSON + Uniqueness ===\n');

    const session2 = await prisma.assessmentSession.create({
      data: { candidateId: candidateA.id, assessmentVersionId: version.id },
    });

    const event = {
      type: 'keydown',
      timestamp: new Date().toISOString(),
      payload: { key: 'a', mod: ['ctrl'], col: 12, row: 5 },
    };

    const batch1 = await prisma.sessionTelemetryBatch.create({
      data: { sessionId: session2.id, sequence: 1, events: [event] },
    });
    check('6B: sequence=1 persists', batch1.sequence === 1);

    const fetchedBatch = await prisma.sessionTelemetryBatch.findUniqueOrThrow({ where: { id: batch1.id } });
    const roundTripped = (fetchedBatch.events as any[])[0].payload;
    check('6B: JSON payload round-trips (key)', roundTripped.key === event.payload.key);
    check('6B: JSON payload round-trips (mod array)', JSON.stringify(roundTripped.mod) === JSON.stringify(event.payload.mod));
    check('6B: JSON payload round-trips (numeric fields)', roundTripped.col === event.payload.col && roundTripped.row === event.payload.row);

    check(
      '6B: duplicate (sessionId,sequence) rejects with unique violation',
      await rejectsWithPattern(
        () => prisma.sessionTelemetryBatch.create({ data: { sessionId: session2.id, sequence: 1, events: [] } }),
        /unique|duplicate/i,
      ),
    );

    const batch2 = await prisma.sessionTelemetryBatch.create({
      data: { sessionId: session2.id, sequence: 2, events: [event, event] },
    });
    check('6B: sequence=2 accepted after sequence=1', batch2.sequence === 2);

    // ── PHASE 6C: TalentAuthorizationRepository real-table resolvers ─────────

    console.log('\n=== Phase 6C: AuthorizationRepository Real-Table Resolvers ===\n');

    const recruiterRole = await prisma.role.create({ data: { key: 'GATE_RECRUITER', name: 'GateRecruiter' } });
    await prisma.permission.create({ data: { roleId: recruiterRole.id, action: 'read', resource: 'talent_assessments' } });
    await prisma.tenantMember.create({ data: { tenantId: tenant.id, userId: userA.id, roleId: recruiterRole.id } });

    const repo = TalentAuthorizationRepository.fromPrisma(prisma);

    const wsTarget = await repo.resolveWorkspaceTarget(workspace.id);
    check('6C: workspace target resolves', wsTarget !== null);
    check('6C: workspace target derives tenantId', wsTarget?.tenantId === tenant.id);

    const avTarget = await repo.resolveAssessmentVersionTarget(version.id, workspace.id);
    check('6C: assessmentVersion target resolves with correct workspace', avTarget !== null);
    check('6C: assessmentVersion target workspaceId matches', avTarget?.workspaceId === workspace.id);
    check('6C: assessmentVersion target tenantId derived', avTarget?.tenantId === tenant.id);

    const avNull = await repo.resolveAssessmentVersionTarget(version.id, '11111111-0000-4000-8000-000000000001');
    check('6C: assessmentVersion target null for wrong workspace', avNull === null);

    const sTarget = await repo.resolveSessionTarget(session.id, workspace.id);
    check('6C: session target resolves', sTarget !== null);
    check('6C: session target propagates candidateProfile.userId as ownerUserId', sTarget?.ownerUserId === userA.id);
    check('6C: session target workspaceId matches', sTarget?.workspaceId === workspace.id);
    check('6C: session target tenantId derived', sTarget?.tenantId === tenant.id);

    // ── PHASE 7: Cross-boundary authorization negatives ───────────────────────

    console.log('\n=== Phase 7: Cross-Boundary Authorization Negatives ===\n');

    const userB = await prisma.user.create({ data: { email: `gate-b-${ts}@test.local` } });
    const profileB = await prisma.candidateProfile.create({ data: { userId: userB.id } });
    const sessionB = await prisma.assessmentSession.create({
      data: { candidateId: profileB.id, assessmentVersionId: version.id },
    });
    const wsB = await prisma.workspace.create({
      data: { tenantId: tenant.id, name: 'WsB', slug: `gate-wsb-${ts}` },
    });

    check('7: A session invisible from WsB', await repo.resolveSessionTarget(session.id, wsB.id) === null);
    check('7: B session invisible from WsB (assessment scoped to WsA)', await repo.resolveSessionTarget(sessionB.id, wsB.id) === null);

    const bInWsA = await repo.resolveSessionTarget(sessionB.id, workspace.id);
    check('7: B session resolves from WsA (same assessment version)', bInWsA !== null);
    check('7: B session ownerUserId = userB.id', bInWsA?.ownerUserId === userB.id);

    check('7: Invalid workspace UUID → null', await repo.resolveWorkspaceTarget('00000000-0000-0000-0000-000000000000') === null);
    check('7: Invalid session UUID → null', await repo.resolveSessionTarget('00000000-0000-0000-0000-000000000000', workspace.id) === null);
    check('7: Invalid project UUID → null', await repo.resolveProjectTarget('00000000-0000-0000-0000-000000000000', workspace.id) === null);
    check('7: Invalid version UUID → null', await repo.resolveAssessmentVersionTarget('00000000-0000-0000-0000-000000000000', workspace.id) === null);
    check('7: Missing workspace context → null', await repo.resolveSessionTarget(session.id, '00000000-0000-0000-0000-000000000002') === null);

    const aSTarget = await repo.resolveSessionTarget(session.id, workspace.id);
    check('7: A session ownerUserId ≠ userB (ABAC boundary)', aSTarget?.ownerUserId !== userB.id);
    check('7: A session ownerUserId = userA (correct ownership)', aSTarget?.ownerUserId === userA.id);

  } finally {
    await prisma.$disconnect();
  }

  // ── SUMMARY ─────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log(`Gate Integration: ${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.error('\nFailed assertions:');
    failures.forEach((f) => console.error(f));
    process.exit(1);
  } else {
    console.log('All assertions passed. ✓');
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
