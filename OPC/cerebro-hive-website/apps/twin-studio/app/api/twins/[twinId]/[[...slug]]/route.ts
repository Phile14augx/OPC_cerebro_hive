import { NextRequest, NextResponse } from 'next/server';
import {
  handleAskPost,
  handleScenariosGet,
  handleScenariosPost,
  handleSimulatorPost,
  handleStateGet,
  handleStatePost,
  handleTwinDelete,
  handleTwinGet,
  handleTwinPatch,
  handleVersionsGet,
  handleVersionsPost,
} from '../../../../../lib/twin-http-handlers';

type RouteContext = { params: Promise<{ twinId: string; slug?: string[] }> };

function action(slug: string[] | undefined) {
  return slug?.[0];
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' } },
    { status: 405 },
  );
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { twinId, slug } = await params;
  const resource = action(slug);
  if (!resource) return handleTwinGet(request, twinId);
  if (resource === 'state') return handleStateGet(request, twinId);
  if (resource === 'versions') return handleVersionsGet(request, twinId);
  if (resource === 'scenarios') return handleScenariosGet(request, twinId);
  return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found.' } }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { twinId, slug } = await params;
  const resource = action(slug);
  if (resource === 'state') return handleStatePost(request, twinId);
  if (resource === 'ask') return handleAskPost(request, twinId);
  if (resource === 'simulator') return handleSimulatorPost(request, twinId);
  if (resource === 'versions') return handleVersionsPost(request, twinId);
  if (resource === 'scenarios') return handleScenariosPost(request, twinId);
  return methodNotAllowed();
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { twinId, slug } = await params;
  if (action(slug)) return methodNotAllowed();
  return handleTwinPatch(request, twinId);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { twinId, slug } = await params;
  if (action(slug)) return methodNotAllowed();
  return handleTwinDelete(request, twinId);
}
