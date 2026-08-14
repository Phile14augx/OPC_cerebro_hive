import { NextRequest, NextResponse } from "next/server";
import { getPolicies, getPolicy, updatePolicy } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

// GET /api/nexarch/policies
export async function GET() {
  const policies = await getPolicies();
  return NextResponse.json({ data: policies, count: policies.length });
}

// PATCH /api/nexarch/policies  (toggle enabled/disabled by id in body)
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const policy = await updatePolicy(id, patch);
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    return NextResponse.json({ data: policy });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
