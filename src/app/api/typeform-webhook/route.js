// src/app/api/typeform-webhook/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Obtener los datos del webhook de Typeform
    const data = await request.json();
    
    // Extraer las respuestas
    const answers = data.form_response.answers;
    
    // Aquí procesarías las respuestas y calcularías el score
    // Por ahora solo las almacenaremos en memoria
    // En un caso real, las guardarías en una base de datos
    
    const formResponse = {
      response_id: data.form_response.token,
      answers: answers.map(answer => ({
        field_id: answer.field.id,
        field_type: answer.field.type,
        answer: answer.type === 'choice' ? answer.choice.label : answer.text
      }))
    };

    // En un caso real, aquí guardarías en base de datos
    console.log('Respuestas recibidas:', formResponse);

    // Responder al webhook
    return NextResponse.json({ 
      success: true, 
      message: 'Responses received successfully',
      response_id: formResponse.response_id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing webhook'
    }, { status: 500 });
  }
}

// Opcional: Endpoint GET para verificar el estado
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint is active' });
}
