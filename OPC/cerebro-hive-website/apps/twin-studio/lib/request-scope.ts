import type { NextRequest } from 'next/server';
export function requestScope(request: NextRequest) { return { tenantId: request.headers.get('x-tenant-id') ?? 'demo-tenant', workspaceId: request.headers.get('x-workspace-id') ?? 'demo-workspace' }; }
