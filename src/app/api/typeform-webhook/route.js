import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Obtener los datos del webhook de Typeform
    const data = await request.json();
    
    // Log para debugging
    console.log('Webhook data received:', data);
    
    // Extraer las respuestas relevantes
    const formResponse = {
      responseId: data.form_response.token,
      answers: data.form_response.answers.map(answer => ({
        questionId: answer.field.id,
        type: answer.field.type,
        answer: getAnswerValue(answer)
      }))
    };

    // Calcular score
    const score = calculateScore(formResponse.answers);
    
    // En un caso real, aquí guardarías los resultados en una base de datos
    // Por ahora solo los logueamos
    console.log('Processed response:', {
      ...formResponse,
      score
    });

    return NextResponse.json({ 
      success: true,
      responseId: formResponse.responseId,
      score
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing webhook request'
    }, { status: 500 });
  }
}

// Función auxiliar para extraer el valor de la respuesta según su tipo
function getAnswerValue(answer) {
  switch (answer.type) {
    case 'choice':
      return answer.choice.label;
    case 'number':
      return answer.number;
    case 'text':
      return answer.text;
    default:
      return null;
  }
}

// Función para calcular el score
function calculateScore(answers) {
  // Aquí implementarías tu lógica de scoring
  // Por ahora retornamos un valor de ejemplo
  return 75;
}

// Endpoint de verificación
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Typeform webhook endpoint is ready to receive responses'
  });
}
