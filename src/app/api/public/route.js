import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Webhook received data:', data);
    
    const formResponse = data.form_response;
    const responseId = formResponse.token;

    const processedResults = processAnswers(formResponse);
    const recommendations = getRecommendations(processedResults.masteryLevel.level);

    const results = {
      responseId,
      timestamp: new Date().toISOString(),
      ...processedResults,
      recommendations
    };

    console.log('Processed results:', results);

    // Guardar en base de datos
    await createAssessmentResult(results);

    const redirectUrl = `https://self-assessment-v0-1.vercel.app/results?response_id=${responseId}`;

    return NextResponse.json({ 
      success: true,
      redirectUrl,
      ...results
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const responseId = request.headers.get('response-id') || request.headers.get('response_id');
    console.log('GET request received with ID:', responseId);
    
    if (!responseId) {
      console.log('No response ID provided in headers');
      return NextResponse.json({ 
        error: 'Missing response ID'
      }, { status: 400 });
    }

    // Eventualmente esto se reemplazaría con: 
    const result = await getAssessmentResultByResponseId(responseId);
    
    console.log('Returning result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ 
      error: 'Error fetching results',
      details: error.message
    }, { status: 500 });
  }
}

// Funciones de procesamiento igual que en versiones anteriores
function processAnswers(formResponse) { /* ... */ }
function determineMasteryLevel(score) { /* ... */ }
function getRecommendations(level) { /* ... */ }
