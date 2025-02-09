import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Webhook data received:', data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Data received successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook',
      details: error.message
    }, { status: 500 });
  }
}

// Endpoint de verificación
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook endpoint is ready'
  });
}
