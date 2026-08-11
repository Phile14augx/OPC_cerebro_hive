import { NextResponse } from "next/server";

export async function GET() {
  const costExplorer = {
    byKind: {
      "database": 45.0,
      "vps": 20.0,
      "kubernetes": 120.0,
      "ai-model": 65.5
    },
    byCategory: {
      "Cloud Compute": 140.0,
      "Data Platform": 45.0,
      "Marketplace": 65.5
    },
    totalUsd: 250.5,
    resourceCount: 4
  };
  return NextResponse.json(costExplorer);
}
