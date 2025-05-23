import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('🔥🔥🔥 ULTIMATE DEBUG VERSION - 2025-05-23 🔥🔥🔥');
    
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

function processAnswers(formResponse) {
  try {
    console.log('🔍 === ULTIMATE DEBUG: ANALIZANDO ESTRUCTURA COMPLETA ===');
    
    // LOG COMPLETO DE LA ESTRUCTURA
    console.log('📋 formResponse keys:', Object.keys(formResponse));
    console.log('📋 formResponse.answers exists:', !!formResponse.answers);
    console.log('📋 formResponse.answers type:', typeof formResponse.answers);
    console.log('📋 formResponse.answers length:', formResponse.answers?.length);

    if (!formResponse.answers) {
      console.error('❌ NO ANSWERS FOUND');
      throw new Error('No answers found in formResponse');
    }

    // LOG DETALLADO DE TODAS LAS RESPUESTAS
    console.log('📝 === TODAS LAS RESPUESTAS RECIBIDAS ===');
    formResponse.answers.forEach((answer, index) => {
      console.log(`Respuesta ${index + 1}:`, {
        type: answer.type,
        fieldId: answer.field?.id,
        fieldType: answer.field?.type,
        choiceLabel: answer.choice?.label,
        choiceId: answer.choice?.id,
        textValue: answer.text,
        numberValue: answer.number,
        fullAnswer: JSON.stringify(answer, null, 2)
      });
    });

    // Filtrar respuestas de opción múltiple
    const multipleChoiceAnswers = formResponse.answers.filter(answer => 
      answer && answer.type === 'choice'
    );

    console.log('🎯 === RESPUESTAS DE OPCIÓN MÚLTIPLE ===');
    console.log(`Total respuestas 'choice': ${multipleChoiceAnswers.length}`);
    
    multipleChoiceAnswers.forEach((answer, index) => {
      console.log(`MC ${index + 1}:`, {
        fieldId: answer.field?.id,
        choiceLabel: answer.choice?.label,
        choiceId: answer.choice?.id
      });
    });

    // Verificar si necesitamos excluir la primera
    console.log('🚨 === ANÁLISIS DE LA PRIMERA RESPUESTA ===');
    if (multipleChoiceAnswers.length > 0) {
      const firstChoice = multipleChoiceAnswers[0];
      console.log('Primera respuesta choice:', {
        fieldId: firstChoice.field?.id,
        choiceLabel: firstChoice.choice?.label,
        isIntroQuestion: firstChoice.choice?.label?.includes('capacidades') || 
                        firstChoice.choice?.label?.includes('curiosidad') ||
                        firstChoice.choice?.label?.includes('selección')
      });
    }

    // Procesar con diferentes estrategias para comparar
    console.log('🔬 === PROCESANDO CON DIFERENTES ESTRATEGIAS ===');
    
    // Estrategia 1: Incluir todas las respuestas choice
    const strategy1Result = processWithStrategy(multipleChoiceAnswers, formResponse, 'INCLUIR_TODAS');
    
    // Estrategia 2: Excluir la primera respuesta choice
    const strategy2Result = processWithStrategy(multipleChoiceAnswers.slice(1), formResponse, 'EXCLUIR_PRIMERA');
    
    console.log('📊 === COMPARACIÓN DE RESULTADOS ===');
    console.log('Estrategia 1 (incluir todas):', {
      totalQuestions: strategy1Result.questionCount,
      totalRawScore: strategy1Result.totalRawScore,
      percentage: strategy1Result.percentage.toFixed(1) + '%'
    });
    
    console.log('Estrategia 2 (excluir primera):', {
      totalQuestions: strategy2Result.questionCount,
      totalRawScore: strategy2Result.totalRawScore,
      percentage: strategy2Result.percentage.toFixed(1) + '%'
    });

    // Decidir cuál usar basado en el número de preguntas
    let finalResult;
    if (strategy2Result.questionCount === 24) {
      console.log('✅ USANDO ESTRATEGIA 2 (excluir primera) - 24 preguntas ✅');
      finalResult = strategy2Result;
    } else if (strategy1Result.questionCount === 24) {
      console.log('✅ USANDO ESTRATEGIA 1 (incluir todas) - 24 preguntas ✅');
      finalResult = strategy1Result;
    } else {
      console.log('⚠️ NINGUNA ESTRATEGIA DA 24 PREGUNTAS, USANDO ESTRATEGIA 2');
      finalResult = strategy2Result;
    }

    console.log('🎯 === RESULTADO FINAL ===');
    console.log(`Total preguntas procesadas: ${finalResult.questionCount}`);
    console.log(`Raw score total: ${finalResult.totalRawScore} / 120`);
    console.log(`Porcentaje final: ${finalResult.percentage.toFixed(1)}%`);

    return finalResult.result;

  } catch (error) {
    console.error('💥 ERROR EN PROCESS ANSWERS:', error);
    return {
      dimensionScores: [0, 0, 0, 0, 0, 0],
      totalScore: 0,
      masteryLevel: determineMasteryLevel(0),
      rawScores: [],
      unmatchedAnswers: [],
      debugInfo: { error: error.message }
    };
  }
}

function processWithStrategy(answersToProcess, formResponse, strategyName) {
  console.log(`🔄 Procesando con ${strategyName}...`);
  
  const dimensionScores = [0, 0, 0, 0, 0, 0];
  const rawScores = [];
  
  answersToProcess.forEach((answer, index) => {
    const field = formResponse.definition.fields.find(f => f.id === answer.field.id);
    let score = 1;
    
    if (field && field.choices) {
      const choiceIndex = field.choices.findIndex(choice => 
        choice.label === answer.choice.label
      );
      if (choiceIndex !== -1) {
        score = choiceIndex + 1;
      }
    }
    
    rawScores.push(score);
    
    // Dividir en dimensiones solo si tenemos exactamente 24 preguntas
    if (answersToProcess.length === 24) {
      const dimensionIndex = Math.floor(index / 4);
      if (dimensionIndex < 6) {
        dimensionScores[dimensionIndex] += score;
      }
    }
  });
  
  const totalRawScore = rawScores.reduce((sum, score) => sum + score, 0);
  const percentage = (totalRawScore / 120) * 100;
  const dimensionPercentages = dimensionScores.map(score => (score / 20) * 100);
  const masteryLevel = determineMasteryLevel(percentage);
  
  return {
    questionCount: answersToProcess.length,
    totalRawScore,
    percentage,
    rawScores,
    result: {
      dimensionScores: dimensionPercentages,
      totalScore: percentage,
      masteryLevel,
      rawScores,
      unmatchedAnswers: [],
      debugInfo: {
        strategy: strategyName,
        totalRawScore,
        dimensionRawScores: dimensionScores,
        questionCount: answersToProcess.length
      }
    }
  };
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
