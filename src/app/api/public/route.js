import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Webhook data received:', data);
    
    // Extraer las respuestas
    const answers = data.form_response.answers;
    const responseId = data.form_response.token;
    
    // Procesar respuestas específicas del formulario
    const processedResults = processAnswers(data.form_response);
    
    // Log detallado de resultados
    console.log('Processed results:', {
      responseId,
      answers: processedResults.answerDetails,
      score: processedResults.score,
      recommendations: processedResults.recommendations
    });
    
    return NextResponse.json({ 
      success: true,
      responseId,
      ...processedResults
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook',
      details: error.message
    }, { status: 500 });
  }
}

function processAnswers(formResponse) {
  const answers = formResponse.definition.fields.map((field, index) => {
    const answer = formResponse.answers ? formResponse.answers[index] : null;
    return {
      question: field.title,
      answer: answer ? answer.choice?.label : null,
      fieldType: field.type
    };
  });

  // Calcular score basado en las respuestas de multiple choice
  let totalPoints = 0;
  let maxPossible = 0;

  answers.forEach(answer => {
    if (answer.fieldType === 'multiple_choice' && answer.answer) {
      // Asignar puntos basados en la posición de la respuesta
      const choiceOptions = formResponse.definition.fields.find(
        f => f.title === answer.question
      )?.choices || [];
      
      const choiceIndex = choiceOptions.findIndex(
        c => c.label === answer.answer
      );

      if (choiceIndex !== -1) {
        totalPoints += choiceIndex + 1;
        maxPossible += choiceOptions.length;
      }
    }
  });

  // Calcular score final (0-100)
  const score = Math.round((totalPoints / maxPossible) * 100);

  return {
    score,
    answerDetails: answers,
    recommendations: getRecommendations(score)
  };
}

function getRecommendations(score) {
  // ... (mantener la función getRecommendations igual)
}
