import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request) {
  try {
    const data = await request.json();
    const formResponse = data.form_response;
    const responseId = formResponse.token;

    // Validar existencia de fields y choices
    formResponse.definition.fields.forEach((field, index) => {
      if (!field) {
        throw new Error(`Field definition for index ${index} is undefined`);
      }
      if (!field.choices) {
        console.warn(`Choices for field index ${index} are undefined`);
      }
    });

    // Procesar las respuestas
    const processedResults = processAnswers(formResponse);
    const recommendations = getRecommendations(processedResults.masteryLevel.level);

    // Preparar datos para la base de datos
    const resultsToStore = {
      responseId,
      totalScore: processedResults.totalScore,
      masteryLevel: processedResults.masteryLevel,
      dimensionScores: processedResults.dimensionScores,
      recommendations
    };

    // Guardar en la base de datos
    await createAssessmentResult(resultsToStore);

    // Enviar respuesta
    return NextResponse.json({ 
      success: true,
      responseId,
      ...processedResults,
      recommendations
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
  // Omitir la primera pregunta (introductoria)
  const dimensionAnswers = formResponse.answers.slice(1);

  // Mapear cada respuesta a un valor numérico (1 al 5)
  const scoredAnswers = dimensionAnswers.map((answer, index) => {
    const field = formResponse.definition.fields[index + 1];
    if (!field.choices) {
      throw new Error(`Choices for field index ${index + 1} are undefined`);
    }
    const choiceIndex = field.choices.findIndex(choice => 
      choice.label === answer.choice.label
    );
    return choiceIndex + 1; // +1 para que el primer índice sea 1
  });

  // Calcular el score por variable (promedio de 5 respuestas)
  const variableScores = [];
  for (let i = 0; i < Math.ceil(scoredAnswers.length / 5); i++) {
    const variableAnswers = scoredAnswers.slice(i * 5, (i + 1) * 5);
    const variableScore = variableAnswers.reduce((a, b) => a + b, 0) / 5;
    variableScores.push(variableScore);
  }

  // Calcular el score por dimensión (promedio de 4 variables)
  const dimensionScores = [];
  for (let i = 0; i < Math.ceil(variableScores.length / 4); i++) {
    const dimensionAnswers = variableScores.slice(i * 4, (i + 1) * 4);
    const dimensionScore = dimensionAnswers.reduce((a, b) => a + b, 0) / 4;
    dimensionScores.push(dimensionScore);
  }

  // Calcular el score total (promedio de 6 dimensiones)
  const totalScore = dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length;

  // Determinar nivel de madurez
  const masteryLevel = determineMasteryLevel(totalScore * 20); // Convertir a porcentaje

  return {
    dimensionScores,
    totalScore: totalScore * 20, // Convertir a porcentaje
    masteryLevel,
    rawScores: scoredAnswers
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

  return recommendationMap[level];
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook endpoint is ready'
  });
}
