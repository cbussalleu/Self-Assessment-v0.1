import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const formResponse = data.form_response;
    const responseId = formResponse.token;
    
    // Procesamiento básico inicial
    const results = {
      responseId,
      timestamp: new Date().toISOString(),
      answers: formResponse.answers || [],
      score: 75, // Por ahora un score fijo de ejemplo
      level: "Proficient"
    };

    console.log('Processed results:', results);

    return NextResponse.json({ 
      success: true,
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

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook endpoint is ready'
  });
}
