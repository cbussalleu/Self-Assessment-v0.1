import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Webhook received data:', data);
    
    const formResponse = data.form_response;
    if (!formResponse) {
      throw new Error('form_response is missing in the received data');
    }
    const response_id = formResponse.token;

    const processedResults = processAnswers(formResponse);
    const recommendations = getRecommendations(processedResults.masteryLevel.level);

    const results = {
      response_id,
      timestamp: new Date().toISOString(),
      ...processedResults,
      recommendations
    };

    console.log('Processed results:', results);

    // Guardar en base de datos
    await createAssessmentResult(results);

    const redirectUrl = `https://self-assessment-v0-1.vercel.app/results?response_id=${response_id}`;

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
    const response_id = request.headers.get('response-id') || request.headers.get('response_id');
    console.log('GET request received with ID:', response_id);
    
    if (!response_id) {
      console.log('No response ID provided in headers');
      return NextResponse.json({ 
        error: 'Missing response ID'
      }, { status: 400 });
    }

    // Eventualmente esto se reemplazaría con: 
    const result = await getAssessmentResultByResponseId(response_id);
    
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

// FUNCIÓN CORREGIDA - EXCLUYE LA PRIMERA PREGUNTA AUTOMÁTICAMENTE
function processAnswers(formResponse) {
  try {
    console.log('Procesando respuestas con modelo corregido (excluyendo primera pregunta)...');
    
    // Filtrar solo las preguntas de opción múltiple
    const multipleChoiceAnswers = formResponse.answers.filter(answer => 
      answer && answer.type === 'choice'
    );

    console.log(`Total respuestas recibidas: ${multipleChoiceAnswers.length}`);

    // SOLUCIÓN: EXCLUIR AUTOMÁTICAMENTE LA PRIMERA PREGUNTA
    // La primera pregunta es siempre introductoria y no debe sumar al puntaje
    const evaluationAnswers = multipleChoiceAnswers.slice(1); // Excluir primera pregunta
    
    console.log(`Respuestas de evaluación (sin primera pregunta): ${evaluationAnswers.length}`);
    console.log(`Esperado: 24 preguntas de evaluación`);

    // Verificar que tenemos exactamente 24 preguntas de evaluación
    if (evaluationAnswers.length !== 24) {
      console.warn(`⚠️ Se esperaban 24 preguntas de evaluación, pero se recibieron ${evaluationAnswers.length}`);
    }

    // Inicializar arrays para almacenar puntajes por dimensión
    const dimensionScores = [0, 0, 0, 0, 0, 0]; // 6 dimensiones
    const dimensionQuestionCounts = [0, 0, 0, 0, 0, 0]; // Contador de preguntas por dimensión
    const processedAnswers = [];
    const unmatchedAnswers = [];
    const rawScores = [];

    // Procesar cada respuesta de evaluación (SIN la primera pregunta)
    evaluationAnswers.forEach((answer, index) => {
      const responseText = answer.choice.label;
      
      // Calcular puntaje usando el método original más confiable:
      // Buscar en qué posición está la opción seleccionada dentro de las opciones de la pregunta
      const field = formResponse.definition.fields.find(f => f.id === answer.field.id);
      
      let score = 1; // Valor por defecto
      
      if (field && field.choices) {
        const choiceIndex = field.choices.findIndex(choice => 
          choice.label === answer.choice.label
        );
        
        if (choiceIndex !== -1) {
          score = choiceIndex + 1; // Convertir índice (0-4) a puntaje (1-5)
        }
      }
      
      rawScores.push(score);
      
      // Calcular a qué dimensión pertenece esta pregunta
      // Las 24 preguntas se dividen en 6 dimensiones de 4 preguntas cada una
      const dimensionIndex = Math.floor(index / 4);
      
      if (dimensionIndex < 6) {
        dimensionScores[dimensionIndex] += score;
        dimensionQuestionCounts[dimensionIndex]++;
        
        processedAnswers.push({
          questionIndex: index,
          response: responseText,
          score: score,
          dimensionIndex: dimensionIndex
        });
      } else {
        console.warn(`⚠️ Pregunta ${index + 1} fuera de rango de dimensiones`);
      }
    });

    // Log de depuración
    console.log('Raw scores (24 preguntas):', rawScores);
    console.log('Respuestas procesadas:', processedAnswers.length);
    console.log('Puntajes por dimensión (raw):', dimensionScores);
    console.log('Preguntas por dimensión:', dimensionQuestionCounts);

    // Calcular puntaje total
    const totalRawScore = dimensionScores.reduce((sum, score) => sum + score, 0);
    
    // Convertir a porcentajes (cada dimensión puede tener máximo 20 puntos)
    const dimensionPercentages = dimensionScores.map(score => (score / 20) * 100);
    
    // Puntaje total como porcentaje (máximo 120 puntos)
    const totalPercentage = (totalRawScore / 120) * 100;

    // Determinar nivel de maestría
    const masteryLevel = determineMasteryLevel(totalPercentage);

    console.log('=== RESULTADOS FINALES ===');
    console.log('Puntaje total raw:', totalRawScore, '/ 120');
    console.log('Puntaje total porcentaje:', totalPercentage.toFixed(1), '%');
    console.log('Dimensiones en porcentaje:', dimensionPercentages.map(p => p.toFixed(1) + '%'));
    console.log('Nivel de maestría:', masteryLevel.level, '-', masteryLevel.description);

    return {
      dimensionScores: dimensionPercentages,
      totalScore: totalPercentage,
      masteryLevel,
      rawScores: rawScores,
      unmatchedAnswers,
      debugInfo: {
        totalRawScore,
        dimensionRawScores: dimensionScores,
        dimensionQuestionCounts,
        totalAnswersReceived: multipleChoiceAnswers.length,
        evaluationAnswersProcessed: evaluationAnswers.length,
        firstQuestionExcluded: true
      }
    };
  } catch (error) {
    console.error('Error processing answers:', error);
    // Devolver valores por defecto en caso de error
    return {
      dimensionScores: [0, 0, 0, 0, 0, 0],
      totalScore: 0,
      masteryLevel: determineMasteryLevel(0),
      rawScores: [],
      unmatchedAnswers: [],
      debugInfo: {
        error: error.message
      }
    };
  }
}

function determineMasteryLevel(score) {
  if (score <= 20) {
    return {
      level: 1,
      description: "Principiante",
      recommendations: "Requiere desarrollo fundamental"
    };
  } else if (score <= 40) {
    return {
      level: 2, 
      description: "En desarrollo",
      recommendations: "Necesita fortalecer capacidades base"
    };
  } else if (score <= 60) {
    return {
      level: 3,
      description: "Competente",
      recommendations: "Buen potencial, enfoque en mejora continua"
    };
  } else if (score <= 80) {
    return {
      level: 4,
      description: "Avanzado",
      recommendations: "Alto desempeño, perfeccionar especialidades"
    };
  } else {
    return {
      level: 5,
      description: "Experto",
      recommendations: "Nivel de excelencia, liderar innovación"
    };
  }
}

function getRecommendations(level) {
  const recommendationMap = {
    1: {
      title: "Desarrollo Inicial",
      description: "Estás comenzando tu viaje en el diseño de servicios. Enfócate en aprender fundamentos y construir una base sólida.",
      generalRecommendations: [
        "Toma cursos introductorios de diseño de servicios",
        "Busca mentores en el campo",
        "Participa en talleres y webinars básicos",
        "Lee libros fundamentales sobre diseño de servicios"
      ]
    },
    2: {
      title: "Crecimiento Temprano",
      description: "Has comenzado a desarrollar tus capacidades. Es momento de fortalecer tus habilidades de manera sistemática.",
      generalRecommendations: [
        "Desarrolla un plan de aprendizaje estructurado",
        "Busca proyectos que te permitan aplicar nuevas habilidades",
        "Participa en comunidades de práctica",
        "Invierte en cursos especializados"
      ]
    },
    3: {
      title: "Competencia Profesional",
      description: "Tienes una base sólida. Ahora es el momento de profundizar y especializarte.",
      generalRecommendations: [
        "Identifica áreas de especialización",
        "Busca proyectos desafiantes",
        "Desarrolla un portafolio robusto",
        "Considera certificaciones profesionales"
      ]
    },
    4: {
      title: "Alto Desempeño",
      description: "Estás muy cerca de la maestría. Enfócate en la innovación y el liderazgo.",
      generalRecommendations: [
        "Lidera proyectos complejos",
        "Comparte conocimiento con otros profesionales",
        "Explora metodologías de vanguardia",
        "Desarrolla pensamiento estratégico"
      ]
    },
    5: {
      title: "Excelencia en Diseño de Servicios",
      description: "Eres un referente en diseño de servicios. Continúa innovando y liderando.",
      generalRecommendations: [
        "Desarrolla metodologías propias",
        "Contribuye a la comunidad académica y profesional",
        "Lidera transformaciones organizacionales",
        "Mentoriza a nuevos profesionales"
      ]
    }
  };

  return recommendationMap[level] || recommendationMap[1];
}
