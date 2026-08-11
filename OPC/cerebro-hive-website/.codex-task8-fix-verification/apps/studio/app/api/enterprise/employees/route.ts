import { NextResponse } from "next/server";
import { getCollection, insertItem, deleteItem } from "@/lib/db";
import { guardMutatingRequest, guardReadRequest, parseJsonBody } from "@/lib/security/guard";
import { enterpriseEmployeeSchema, enterpriseEmployeeIdSchema } from "@/lib/security/schemas";

// SECURITY NOTE: this route has no authentication/authorization layer yet — it's
// a demo "enterprise dashboard" backed by seed data (lib/db.ts), not a real
// customer database. The guards below (origin check, rate limit, strict
// validation) are real, but they do not verify *who* is calling — anyone who
// can reach this route can add or delete a seat. Before this ever holds real
// customer data, it needs a session check that scopes reads/writes to the
// caller's own organization. Tracked in the security roadmap doc as a P0 item.

export async function GET(request: Request) {
  const guard = await guardReadRequest(request, { routeName: "enterprise-employees:get", limit: 60, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  try {
    const employees = await getCollection("employees");
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("API Error in GET /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "enterprise-employees:post", limit: 10, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = enterpriseEmployeeSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, course } = parsed.data;

  try {
    const employees = await getCollection("employees");
    if (employees.length >= 20) {
      return NextResponse.json({ error: "No available classroom seats remaining" }, { status: 400 });
    }

    const empId = `EMP-${Math.floor(106 + Math.random() * 900)}`;
    const newEmployee = await insertItem("employees", {
      id: empId,
      name,
      email,
      course,
      progress: 0,
      score: 0,
      certified: false,
      lastActive: "Never",
    });

    return NextResponse.json({ employee: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to add employee" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "enterprise-employees:delete", limit: 10, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const parsedId = enterpriseEmployeeIdSchema.safeParse(idParam);
  if (!parsedId.success) {
    return NextResponse.json({ error: "A valid employee id is required" }, { status: 400 });
  }

  try {
    const success = await deleteItem("employees", parsedId.data);
    if (!success) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Seat revoked successfully" });
  } catch (error) {
    console.error("API Error in DELETE /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to revoke seat" }, { status: 500 });
  }
}
