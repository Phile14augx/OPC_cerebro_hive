import { IndustryBriefSchema } from "@cerebro/twin-contracts";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, validationErrorResponse } from "../../../../lib/api-error-response";
import { authenticatedRequestContext } from "../../../../lib/twin-runtime";
import { generateIndustryModel } from "../../../../modules/industry/deterministic-industry-provider";

export async function POST(request: NextRequest) {
  try {
    await authenticatedRequestContext.resolve(request, "WRITE");

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return validationErrorResponse("Request body must be valid JSON.");
    }

    const brief = IndustryBriefSchema.safeParse(input);
    if (!brief.success) return validationErrorResponse();
    return NextResponse.json({ data: generateIndustryModel(brief.data) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
