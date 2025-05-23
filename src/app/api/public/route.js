import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

// FORCE CACHE INVALIDATION - Cambiar este número invalida TODA la función
const FORCE_CACHE_INVALIDATION = "v2025_05_23_CACHE_CLEAR_001";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // LOG SUPER OBVIO PARA CONFIRMAR NUEVA VERSIÓN
    console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢');
    console.log('🟢 NUEVA VERSIÓN EJECUTÁNDOSE - CACHE INVALIDATED');
    console.log('🟢 VERSION:', FORCE_CACHE_INVALIDATION);
    console.log('🟢 TIMESTAMP:', new Date().toISOString());
    console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢');
    
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
      version: FORCE_CACHE_INVALIDATION,
      ...processedResults,
      recommendations
    };

    console.log('💾 GUARDANDO RESULTADOS NUEVA VERSIÓN:', {
      version: FORCE_CACHE_INVALIDATION,
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
      version: FORCE_CACHE_INVALIDATION,
      ...results
    });

  } catch (error) {
    console.error('💥 ERROR NUEVA VERSIÓN:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook',
      details: error.message,
      version: FORCE_CACHE_INVALIDATION
    }, { status: 500 });
  }
}

export async function GET(request) {
  console.log('🟢 GET REQUEST NUEVA VERSIÓN:', FORCE_CACHE_INVALIDATION);
  try {
    const response_id = request.headers.get('response-id') || request.headers.get('response_id');
    console.log('GET request received with ID:', response_id);
    
    if (!response_id) {
      console.log('No response ID provided in headers');
      return NextResponse.json({ 
        error: 'Missing response ID',
        version: FORCE_CACHE_INVALIDATION
      }, { status: 400 });
    }

    const result = await getAssessmentResultByResponseId(response_id);
    
    console.log('Returning result:', result);
    return NextResponse.json({
      ...result,
      version: FORCE_CACHE_INVALIDATION
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ 
      error: 'Error fetching results',
      details: error.message,
      version: FORCE_CACHE_INVALIDATION
    }, { status: 500 });
  }
}

function processAnswers(formResponse) {
  console.log('🔥🔥🔥 PROCESS ANSWERS - NUEVA VERSIÓN 🔥🔥🔥');
  console.log('🔥 VERSION:', FORCE_CACHE_INVALIDATION);
  console.log('🔥 TIMESTAMP:', new Date().toISOString());
  
  try {
    if (!formResponse.answers) {
      console.error('❌ NO ANSWERS FOUND');
      throw new Error('No answers found in formResponse');
    }

    // LOG CRÍTICO: Mostrar estructura de respuestas
    console.log('📋 === ESTRUCTURA DE RESPUESTAS ===');
    console.log('📋 Total answers:', formResponse.answers?.length);
    console.log('📋 Answer types:', formResponse.answers?.map(a => a.type));

    // Filtrar respuestas de opción múltiple
    const multipleChoiceAnswers = formResponse.answers.filter(answer => 
      answer && answer.type === 'choice'
    );

    console.log('🎯 === RESPUESTAS CHOICE ===');
    console.log(`🎯 Total respuestas 'choice': ${multipleChoiceAnswers.length}`);
    
    // LOG DETALLADO DE CADA RESPUESTA CHOICE
    multipleChoiceAnswers.forEach((answer, index) => {
      console.log(`🎯 Choice ${index + 1}:`, {
        fieldId: answer.field?.id,
        choiceLabel: answer.choice?.label?.substring(0, 50) + '...',
        choiceIndex: answer.choice?.id
      });
    });

    // 🚨 EXCLUSIÓN CRÍTICA: PRIMERA PREGUNTA
    console.log('🚨 === EXCLUYENDO PRIMERA PREGUNTA ===');
    console.log('🚨 Antes de excluir:', multipleChoiceAnswers.length, 'respuestas');
    
    const evaluationAnswers = multipleChoiceAnswers.slice(1); // ← EXCLUIR PRIMERA
    
    console.log('🚨 Después de excluir primera:', evaluationAnswers.length, 'respuestas');
    console.log('🚨 ESPERADO: 24 respuestas de evaluación');
    
    if (evaluationAnswers.length !== 24) {
      console.error(`🚨 ERROR: Se esperaban 24 respuestas, recibidas ${evaluationAnswers.length}`);
    }

    // PROCESAR SOLO LAS 24 RESPUESTAS DE EVALUACIÓN
    const dimensionScores = [0, 0, 0, 0, 0, 0];
    const rawScores = [];

    console.log('🔄 === PROCESANDO 24 RESPUESTAS DE EVALUACIÓN ===');
    
    evaluationAnswers.forEach((answer, index) => {
      const field = formResponse.definition.fields.find(f => f.id === answer.field.id);
      let score = 1;
      
      if (field && field.choices) {
        const choiceIndex = field.choices.findIndex(choice => 
          choice.label === answer.choice.label
        );
        if (choiceIndex !== -1) {
          score = choiceIndex + 1; // 0-4 → 1-5
        }
      }
      
      rawScores.push(score);
      
      // Dividir en 6 dimensiones de 4 preguntas cada una
      const dimensionIndex = Math.floor(index / 4);
      if (dimensionIndex < 6) {
        dimensionScores[dimensionIndex] += score;
      }
      
      console.log(`🔄 Q${index + 1}: Score=${score}, Dim=${dimensionIndex + 1}`);
    });

    const totalRawScore = dimensionScores.reduce((sum, score) => sum + score, 0);
    const dimensionPercentages = dimensionScores.map(score => (score / 20) * 100);
    const totalPercentage = (totalRawScore / 120) * 100;
    const masteryLevel = determineMasteryLevel(totalPercentage);

    console.log('🎯 === RESULTADOS FINALES CORREGIDOS ===');
    console.log(`🎯 Version: ${FORCE_CACHE_INVALIDATION}`);
    console.log(`🎯 Raw Scores (${rawScores.length}):`, rawScores);
    console.log(`🎯 Total Raw: ${totalRawScore} / 120`);
    console.log(`🎯 Porcentaje: ${totalPercentage.toFixed(2)}%`);
    console.log(`🎯 Dimensiones: [${dimensionPercentages.map(p => p.toFixed(1) + '%').join(', ')}]`);

    return {
      dimensionScores: dimensionPercentages,
      totalScore: totalPercentage,
      masteryLevel,
      rawScores: rawScores,
      unmatchedAnswers: [],
      debugInfo: {
        version: FORCE_CACHE_INVALIDATION,
        totalRawScore,
        dimensionRawScores: dimensionScores,
        evaluationQuestionsProcessed: evaluationAnswers.length,
        firstQuestionExcluded: true
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
        version: FORCE_CACHE_INVALIDATION
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
