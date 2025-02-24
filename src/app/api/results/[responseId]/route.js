import { NextResponse } from 'next/server';
import { getAssessmentResultByResponseId } from '@/lib/models/assessment';

export async function GET(request, { params }) {
  const { response_Id } = params;

  try {
    const result = await getAssessmentResultByResponseId(response_Id);

    if (!result) {
      return NextResponse.json({ 
        error: 'Results not found' 
      }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ 
      error: 'Error fetching results',
      details: error.message
    }, { status: 500 });
  }
}
