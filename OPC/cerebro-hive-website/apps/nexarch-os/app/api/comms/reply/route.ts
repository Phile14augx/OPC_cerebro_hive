import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { envStatus } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const imap = envStatus(["IMAP_HOST", "IMAP_USER", "IMAP_PASSWORD"]);
  const smtp = envStatus(["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"]);
  const github = envStatus(["GITHUB_TOKEN"]);
  getDb().comms.markReplied(body.id);
  if (body.id.startsWith("gh-") && github === "connected") {
    return NextResponse.json({
      status: "connected",
      detail: "Local GitHub thread marked replied. Outbound GitHub comments are not posted from this route.",
    });
  }
  if (smtp === "connected") {
    return NextResponse.json({
      status: "connected",
      detail: "SMTP credentials present. Live send is not implemented in this slice; local status updated.",
    });
  }
  if (imap !== "connected") {
    return NextResponse.json({
      status: "not_configured",
      detail: "Thread marked replied locally. IMAP is fetch-only; SMTP is not_configured so nothing was sent.",
    });
  }
  return NextResponse.json({
    status: "not_configured",
    detail: "IMAP is connected for fetch. Send needs SMTP_HOST which is not_configured. Local status updated.",
  });
}
