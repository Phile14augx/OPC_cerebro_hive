/**
 * POST /api/onboard   { tenantName, industry, size, primaryRole, goals }
 * Creates a new Tenant + Workspace in Prisma, then asks Claude to
 * generate intelligent default agents, workflows, and a welcome narrative.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db';
import { generateOnboardingDefaults } from '@/shared/lib/claude-client';
import type { OnboardingConfig, OnboardingResult } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse<OnboardingResult | { error: string }>> {
  try {
    const config = await req.json() as OnboardingConfig;

    if (!config.tenantName?.trim()) {
      return NextResponse.json({ error: 'tenantName is required.' }, { status: 400 });
    }

    // Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: config.tenantName.trim(),
        slug: config.tenantName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        plan: config.size === 'enterprise' ? 'ENTERPRISE' : config.size === 'mid-market' ? 'BUSINESS' : 'STARTER',
        metadata: {
          industry: config.industry,
          size: config.size,
          goals: config.goals,
          onboardedAt: new Date().toISOString(),
        } as Record<string, unknown>,
      },
    });

    // Create default Workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${config.tenantName} Workspace`,
        tenantId: tenant.id,
        isDefault: true,
      },
    });

    // Ask Claude to recommend agents + workflows and write welcome
    const defaults = await generateOnboardingDefaults(config);

    const result: OnboardingResult = {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      defaultAgents: defaults.defaultAgents,
      suggestedWorkflows: defaults.suggestedWorkflows,
      welcomeNarrative: defaults.welcomeNarrative,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API POST /api/onboard]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
