import { NextResponse } fro 'next/server';

export async function POST(request) {
  try {
    // Verificar la autenticación
    const typeformSignature = request.headers.get('typeform-signature');
    
    if (!typeformSignature) {
      return NextResponse.json({ 
        error: 'No signature provided' 
      }, { status: 401 });
    }

    // Resto del código...
    const data = await request.json();
    console.log('Webhook data received:', data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Data received successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Typeform webhook endpoint is ready'
  });
}
