import { NextResponse } from "next/server";

const STATUS_BY_CODE: Readonly<Record<string, number>> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  WORKSPACE_REQUIRED: 400,
  TWIN_NOT_FOUND: 404,
  PROPOSAL_NOT_FOUND: 404,
  APPROVAL_REQUIRED: 409,
};

export function validationErrorResponse(message = "Request validation failed.") {
  return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
}

export function apiErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = STATUS_BY_CODE[code];

  if (status) {
    return NextResponse.json({ error: { code, message: code } }, { status });
  }

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Unexpected server error." } },
    { status: 500 },
  );
}
