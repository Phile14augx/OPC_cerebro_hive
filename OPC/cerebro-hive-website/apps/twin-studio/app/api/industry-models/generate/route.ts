import { NextRequest,NextResponse } from 'next/server';
import { generateIndustryModel } from '../../../../modules/industry/deterministic-industry-provider';
export async function POST(request:NextRequest){ try{return NextResponse.json({data:generateIndustryModel(await request.json())});}catch(error){return NextResponse.json({error:{code:'VALIDATION_ERROR',message:error instanceof Error?error.message:'Invalid industry brief'}},{status:400});} }
