export const dynamic = "force-static";
import { NextResponse } from "next/server";
import { getCollection, insertItem, deleteItem } from "@/lib/db";

export async function GET() {
  try {
    const employees = await getCollection("employees");
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("API Error in GET /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, course } = body;

    if (!name || !email || !course) {
      return NextResponse.json({ error: "Name, email, and course are required" }, { status: 400 });
    }

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
      lastActive: "Never"
    });

    return NextResponse.json({ employee: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to add employee" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const success = await deleteItem("employees", id);
    if (!success) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Seat revoked successfully" });
  } catch (error) {
    console.error("API Error in DELETE /api/enterprise/employees:", error);
    return NextResponse.json({ error: "Failed to revoke seat" }, { status: 500 });
  }
}
