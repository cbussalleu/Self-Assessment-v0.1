import { NextResponse } from 'next/server';

// Removemos esta configuración que estaba causando problemas
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(request) {
  try {
    // Verificar el header de Typeform
    const typeformSignature = request.headers.get('Typeform-Signature');
    
    // Log de headers para debugging
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Headers received:', headers);

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

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Typeform webhook endpoint is ready'
  });
}
