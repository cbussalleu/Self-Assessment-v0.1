import { NextResponse } from 'next/server';
import { getAssessmentResultByResponseId } from '@/lib/models/assessment';

export async function GET(request) {
  try {
    const response_Id = request.headers.get('response_id');

    if (!response_Id) {
      return NextResponse.json({ 
        error: 'Missing response ID'
      }, { status: 400 });
    }

    const result = await getAssessmentResultByResponseId(response_Id);

    if (!result) {
      return NextResponse.json({ 
        error: 'No results found for the provided response ID'
      }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ 
      error: 'Error fetching results'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Webhook received data:', data);
    
    const formResponse = data.form_response;
    const response_Id = formResponse.token;

    const processedResults = processAnswers(formResponse);
    const recommendations = getRecommendations(processedResults.masteryLevel.level);

    const results = {
      response_Id,
      timestamp: new Date().toISOString(),
      ...processedResults,
      recommendations
    };

    console.log('Processed results:', results);

    const redirectUrl = `https://self-assessment-v0-1.vercel.app/results?response_id={form_response.token}`;

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

function processAnswers(formResponse) {
  try {
    const introQuestionIndex = formResponse.definition.fields.findIndex(
      field => field.title.toLowerCase().includes('por qué') || 
              field.title.toLowerCase().includes('why')
    );

    const fields = formResponse.definition.fields.filter((field, index) => 
      index !== introQuestionIndex && 
      field.type === 'multiple_choice'
    );

    const answers = formResponse.answers.filter((answer, index) => 
      index !== introQuestionIndex && 
      answer.type === 'choice'
    );

    console.log('Number of fields:', fields.length);
    console.log('Number of answers:', answers.length);

    const scoredAnswers = answers.map(answer => {
      const field = fields.find(f => f.id === answer.field.id);
      const choiceIndex = field.choices.findIndex(choice => 
        choice.label === answer.choice.label
      );
      return choiceIndex + 1;
    });

    const dimensionScores = [];
    for (let i = 0; i < 6; i++) {
      const start = i * 4;
      const dimensionAnswers = scoredAnswers.slice(start, start + 4);
      const dimensionScore = dimensionAnswers.reduce((a, b) => a + b, 0) / 4;
      dimensionScores.push(dimensionScore * 20);
    }

    const totalScore = dimensionScores.reduce((a, b) => a + b, 0) / 6;

    return {
      dimensionScores,
      totalScore,
      masteryLevel: determineMasteryLevel(totalScore),
      rawScores: scoredAnswers
    };
  } catch (error) {
    console.error('Error processing answers:', error);
    throw new Error(`Error processing answers: ${error.message}`);
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

  return recommendationMap[level];
}
