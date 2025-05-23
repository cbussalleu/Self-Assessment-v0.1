import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('🚀 WEBHOOK INICIADO - VERSIÓN CORREGIDA 2025-05-23');
    
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

    console.log('💾 GUARDANDO RESULTADOS:', {
      totalScore: results.totalScore,
      dimensionScores: results.dimensionScores,
      masteryLevel: results.masteryLevel.level
    });

    // Guardar en base de datos
    await createAssessmentResult(results);

    const redirectUrl = `https://self-assessment-v0-1.vercel.app/results?response_id=${response_id}`;

    return NextResponse.json({ 
      success: true,
      redirectUrl,
      ...results
    });

  } catch (error) {
    console.error('💥 ERROR:', error);
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

// 🔥 FUNCIÓN CORREGIDA CON DEBUG INTENSIVO
function processAnswers(formResponse) {
  try {
    console.log('🔍 PROCESANDO RESPUESTAS - VERSIÓN CORREGIDA');
    console.log('📊 Timestamp del proceso:', new Date().toISOString());
    
    // Verificar si formResponse.answers existe
    if (!formResponse.answers) {
      console.error('❌ NO SE ENCONTRARON RESPUESTAS EN formResponse.answers');
      console.log('formResponse keys:', Object.keys(formResponse));
      throw new Error('No answers found in formResponse');
    }

    // Filtrar solo las preguntas de opción múltiple
    const multipleChoiceAnswers = formResponse.answers.filter(answer => 
      answer && answer.type === 'choice'
    );

    console.log(`📝 RESPUESTAS RECIBIDAS: ${multipleChoiceAnswers.length}`);
    
    // Log detallado de las primeras 3 respuestas
    console.log('🔍 PRIMERAS 3 RESPUESTAS:');
    multipleChoiceAnswers.slice(0, 3).forEach((answer, index) => {
      console.log(`  ${index + 1}. Field: ${answer.field?.id}, Choice: "${answer.choice?.label}"`);
    });

    // 🚨 EXCLUSIÓN CRÍTICA: PRIMERA PREGUNTA
    console.log('⚠️ EXCLUYENDO PRIMERA PREGUNTA...');
    const evaluationAnswers = multipleChoiceAnswers.slice(1); // ← CRÍTICO: Excluir primera
    
    console.log(`✅ RESPUESTAS DE EVALUACIÓN (SIN PRIMERA): ${evaluationAnswers.length}`);
    console.log(`✅ ESPERADO: 24 preguntas de evaluación`);

    if (evaluationAnswers.length !== 24) {
      console.warn(`⚠️ ADVERTENCIA: Se esperaban 24 preguntas, recibidas ${evaluationAnswers.length}`);
    }

    // Inicializar arrays
    const dimensionScores = [0, 0, 0, 0, 0, 0]; // 6 dimensiones
    const dimensionQuestionCounts = [0, 0, 0, 0, 0, 0];
    const processedAnswers = [];
    const rawScores = [];

    console.log('🔄 PROCESANDO CADA RESPUESTA DE EVALUACIÓN...');

    // Procesar SOLO las respuestas de evaluación (sin primera pregunta)
    evaluationAnswers.forEach((answer, index) => {
      const responseText = answer.choice.label;
      
      // Buscar el field correspondiente en la definición
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
      
      // Calcular dimensión (0-5)
      const dimensionIndex = Math.floor(index / 4);
      
      if (dimensionIndex < 6) {
        dimensionScores[dimensionIndex] += score;
        dimensionQuestionCounts[dimensionIndex]++;
        
        processedAnswers.push({
          questionIndex: index,
          response: responseText.substring(0, 50) + '...',
          score: score,
          dimensionIndex: dimensionIndex
        });
        
        console.log(`  ${index + 1}. Dim${dimensionIndex + 1}, Score: ${score}`);
      } else {
        console.warn(`⚠️ Pregunta ${index + 1} fuera de rango de dimensiones`);
      }
    });

    // 📊 CÁLCULOS FINALES
    const totalRawScore = dimensionScores.reduce((sum, score) => sum + score, 0);
    const dimensionPercentages = dimensionScores.map(score => (score / 20) * 100);
    const totalPercentage = (totalRawScore / 120) * 100;
    const masteryLevel = determineMasteryLevel(totalPercentage);

    console.log('🎯 RESULTADOS FINALES:');
    console.log(`   📊 Raw Scores (${rawScores.length}):`, rawScores);
    console.log(`   🔢 Total Raw: ${totalRawScore} / 120`);
    console.log(`   📈 Porcentaje: ${totalPercentage.toFixed(1)}%`);
    console.log(`   📋 Dimensiones: [${dimensionPercentages.map(p => p.toFixed(0) + '%').join(', ')}]`);
    console.log(`   🏆 Nivel: ${masteryLevel.level} - ${masteryLevel.description}`);
    
    // Verificación crítica
    if (rawScores.length !== 24) {
      console.error(`❌ ERROR CRÍTICO: Se procesaron ${rawScores.length} preguntas en lugar de 24`);
    }
    
    if (totalRawScore > 120) {
      console.error(`❌ ERROR CRÍTICO: Total ${totalRawScore} excede máximo de 120`);
    }

    return {
      dimensionScores: dimensionPercentages,
      totalScore: totalPercentage,
      masteryLevel,
      rawScores: rawScores,
      unmatchedAnswers: [],
      debugInfo: {
        totalRawScore,
        dimensionRawScores: dimensionScores,
        dimensionQuestionCounts,
        totalAnswersReceived: multipleChoiceAnswers.length,
        evaluationAnswersProcessed: evaluationAnswers.length,
        firstQuestionExcluded: true,
        version: 'CORRECTED_2025_05_23'
      }
    };
  } catch (error) {
    console.error('💥 ERROR EN PROCESS ANSWERS:', error);
    return {
      dimensionScores: [0, 0, 0, 0, 0, 0],
      totalScore: 0,
      masteryLevel: determineMasteryLevel(0),
      rawScores: [],
      unmatchedAnswers: [],
      debugInfo: {
        error: error.message,
        version: 'ERROR_2025_05_23'
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
