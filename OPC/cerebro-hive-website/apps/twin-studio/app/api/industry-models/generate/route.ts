import { IndustryBriefSchema } from '@cerebro/twin-contracts';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../lib/authenticated-request-context';
import { industryModelProvider } from '../../../../modules/industry/deterministic-industry-provider';

export async function POST(request: NextRequest) {
  try {
    await authenticatedRequestContext(request, 'WRITE');
    const brief = IndustryBriefSchema.parse(await request.json());
    const proposal = industryModelProvider.generate(brief);
    return NextResponse.json({ data: proposal });
  } catch (error) {
    return apiError(error);
  }
}
