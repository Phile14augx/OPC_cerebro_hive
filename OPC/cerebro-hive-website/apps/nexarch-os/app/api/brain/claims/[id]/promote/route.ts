import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { promoteFactToPrisma } from "@/lib/hive";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const promoted = getDb().claims.promote(id);
  if (!promoted) return NextResponse.json({ error: "claim not found or rejected" }, { status: 404 });
  const prisma = await promoteFactToPrisma(promoted);
  return NextResponse.json({
    claim: promoted,
    prisma: prisma.ok
      ? { status: "connected", memoryId: prisma.data.memoryId }
      : { status: prisma.status, detail: prisma.detail },
  });
}
