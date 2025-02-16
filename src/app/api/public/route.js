import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const formResponse = data.form_response;
    const responseId = formResponse.token;
    
    // Procesar las respuestas y calcular score
    const processedResults = processAnswers(formResponse);
    
    // Generar recomendaciones basadas en el score
    const recommendations = getRecommendations(processedResults.score);
    
    const results = {
      responseId,
      ...processedResults,
      recommendations
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

function processAnswers(formResponse) {
  // Mapear las respuestas excluyendo preguntas de texto largo
  const answers = formResponse.definition.fields
    .filter(field => field.type === 'multiple_choice')
    .map((field, index) => {
      const choiceIndex = field.choices.findIndex(
        choice => choice.label === formResponse.answers[index]?.choice?.label
      );
      
      return {
        question: field.title,
        answer: formResponse.answers[index]?.choice?.label,
        score: choiceIndex + 1,
        maxScore: field.choices.length
      };
    });

  // Calcular score total
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  const maxPossibleScore = answers.reduce((sum, answer) => sum + answer.maxScore, 0);
  const finalScore = Math.round((totalScore / maxPossibleScore) * 100);

  return {
    answers,
    score: finalScore,
    scoreDetails: {
      total: totalScore,
      possible: maxPossibleScore,
      percentage: finalScore
    }
  };
}

function getRecommendations(score) {
  if (score <= 20) {
    return {
      level: 'Principiante',
      title: 'Iniciando tu Viaje en Service Design',
      description: 'Estás en las etapas iniciales de tu desarrollo en Service Design.',
      recommendations: [
        'Enfócate en aprender los conceptos básicos de Service Design',
        'Participa en workshops y cursos introductorios',
        'Busca mentores o guías en tu organización',
        'Comienza con proyectos pequeños y bien definidos'
      ]
    };
  } else if (score <= 40) {
    return {
      level: 'En Desarrollo',
      title: 'Construyendo Bases Sólidas',
      description: 'Estás desarrollando tus habilidades y conocimientos básicos.',
      recommendations: [
        'Profundiza en metodologías de diseño centrado en el usuario',
        'Practica técnicas de facilitación y comunicación',
        'Participa en más proyectos interdisciplinarios',
        'Documenta y reflexiona sobre tus experiencias'
      ]
    };
  }
  // ... (añadir más niveles según sea necesario)
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook endpoint is ready'
  });
}
