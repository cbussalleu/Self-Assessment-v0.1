import { NextResponse } from 'next/server';
import { createAssessmentResult } from '@/lib/models/assessment';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Diccionario de mapeo de respuestas a puntajes (basado en el CSV real)
const RESPONSE_SCORING_MAP = {
  // Primera pregunta (no suma puntaje) - Dimensión: Ninguna
  "Me gustaría reconocer el nivel de mis capacidades para el diseño de servicios.": { puntaje: 0, dimension: "ninguna" },
  "Estoy aquí por curiosidad": { puntaje: 0, dimension: "ninguna" },
  "Estoy en un proceso de selección y el reclutador me pidió compartirle los resultados de este self-asssessment.": { puntaje: 0, dimension: "ninguna" },
  "Un jefe o líder de mi centro de trabajo me sugirió realizar este self-assessment.": { puntaje: 0, dimension: "ninguna" },
  "Other": { puntaje: 0, dimension: "ninguna" },

  // === CAPACIDADES ORGANIZACIONALES ===
  // Alineación de iniciativas de diseño con objetivos organizacionales
  "No comprendo cómo mis diseños se relacionan con los objetivos organizacionales": { puntaje: 1, dimension: "organizacional" },
  "Conozco los objetivos pero raramente los considero en mis diseños": { puntaje: 2, dimension: "organizacional" },
  "Ocasionalmente integro objetivos organizacionales en mis diseños": { puntaje: 3, dimension: "organizacional" },
  "Regularmente alineo mis diseños con objetivos estratégicos": { puntaje: 4, dimension: "organizacional" },
  "Sistemáticamente traduzco objetivos organizacionales en soluciones de diseño efectivas": { puntaje: 5, dimension: "organizacional" },
  
  // Comprensión de dinámicas organizacionales
  "No entiendo las dinámicas internas de la organización": { puntaje: 1, dimension: "organizacional" },
  "Tengo una comprensión básica de la estructura organizacional": { puntaje: 2, dimension: "organizacional" },
  "Comprendo las principales dinámicas e interacciones": { puntaje: 3, dimension: "organizacional" },
  "Manejo efectivamente las dinámicas organizacionales complejas": { puntaje: 4, dimension: "organizacional" },
  "Influyo positivamente en las dinámicas organizacionales": { puntaje: 5, dimension: "organizacional" },
  
  // Integración de perspectivas departamentales
  "Trabajo exclusivamente desde mi perspectiva": { puntaje: 1, dimension: "organizacional" },
  "Ocasionalmente consulto otros departamentos": { puntaje: 2, dimension: "organizacional" },
  "Regularmente considero diferentes perspectivas departamentales": { puntaje: 3, dimension: "organizacional" },
  "Integro activamente múltiples perspectivas en mis proyectos": { puntaje: 4, dimension: "organizacional" },
  "Lidero exitosamente la colaboración interdepartamental": { puntaje: 5, dimension: "organizacional" },
  
  // Gestión de recursos de diseño
  "No manejo recursos directamente": { puntaje: 1, dimension: "organizacional" },
  "Gestiono recursos básicos con supervisión": { puntaje: 2, dimension: "organizacional" },
  "Administro recursos de manera independiente": { puntaje: 3, dimension: "organizacional" },
  "Optimizo el uso de recursos disponibles": { puntaje: 4, dimension: "organizacional" },
  "Maximizo el impacto con recursos limitados": { puntaje: 5, dimension: "organizacional" },

  // === CAPACIDADES INTERPERSONALES ===
  // Comunicación interdisciplinaria
  "Tengo dificultades para comunicarme fuera de mi disciplina": { puntaje: 1, dimension: "interpersonal" },
  "Me comunico de manera básica con otros profesionales": { puntaje: 2, dimension: "interpersonal" },
  "Mantengo comunicación efectiva con diferentes disciplinas": { puntaje: 3, dimension: "interpersonal" },
  "Facilito el diálogo interdisciplinario efectivamente": { puntaje: 4, dimension: "interpersonal" },
  "Promuevo una comunicación excepcional entre disciplinas": { puntaje: 5, dimension: "interpersonal" },
  
  // Facilitación de workshops
  "No tengo experiencia facilitando workshops": { puntaje: 1, dimension: "interpersonal" },
  "Facilito sesiones básicas con apoyo": { puntaje: 2, dimension: "interpersonal" },
  "Conduzco workshops de manera independiente": { puntaje: 3, dimension: "interpersonal" },
  "Diseño y facilito workshops complejos efectivamente": { puntaje: 4, dimension: "interpersonal" },
  "Soy referente en facilitación de sesiones colaborativas": { puntaje: 5, dimension: "interpersonal" },
  
  // Manejo de conflictos
  "Evito situaciones de conflicto": { puntaje: 1, dimension: "interpersonal" },
  "Manejo conflictos básicos con apoyo": { puntaje: 2, dimension: "interpersonal" },
  "Resuelvo conflictos comunes independientemente": { puntaje: 3, dimension: "interpersonal" },
  "Gestiono conflictos complejos efectivamente": { puntaje: 4, dimension: "interpersonal" },
  "Prevengo y transformo conflictos en oportunidades": { puntaje: 5, dimension: "interpersonal" },
  
  // Construcción de relaciones profesionales
  "Me limito a interacciones necesarias": { puntaje: 1, dimension: "interpersonal" },
  "Mantengo relaciones profesionales básicas": { puntaje: 2, dimension: "interpersonal" },
  "Desarrollo relaciones colaborativas efectivas": { puntaje: 3, dimension: "interpersonal" },
  "Construyo redes profesionales sólidas": { puntaje: 4, dimension: "interpersonal" },
  "Cultivo alianzas estratégicas duraderas": { puntaje: 5, dimension: "interpersonal" },

  // === CAPACIDADES INDIVIDUALES - COGNITIVAS ===
  // Comprensión de sistemas complejos
  "Me cuesta entender sistemas básicos": { puntaje: 1, dimension: "cognitiva" },
  "Comprendo sistemas simples": { puntaje: 2, dimension: "cognitiva" },
  "Analizo sistemas de complejidad moderada": { puntaje: 3, dimension: "cognitiva" },
  "Manejo efectivamente sistemas complejos": { puntaje: 4, dimension: "cognitiva" },
  "Domino el análisis de sistemas altamente complejos": { puntaje: 5, dimension: "cognitiva" },
  
  // Pensamiento abstracto
  "Me cuesta trabajar con conceptos abstractos": { puntaje: 1, dimension: "cognitiva" },
  "Manejo conceptos abstractos básicos": { puntaje: 2, dimension: "cognitiva" },
  "Trabajo efectivamente con abstracciones comunes": { puntaje: 3, dimension: "cognitiva" },
  "Desarrollo modelos conceptuales complejos": { puntaje: 4, dimension: "cognitiva" },
  "Creo frameworks conceptuales innovadores": { puntaje: 5, dimension: "cognitiva" },
  
  // Generación de soluciones innovadoras
  "Me apego a soluciones existentes": { puntaje: 1, dimension: "cognitiva" },
  "Propongo variaciones menores a soluciones conocidas": { puntaje: 2, dimension: "cognitiva" },
  "Desarrollo soluciones moderadamente innovadoras": { puntaje: 3, dimension: "cognitiva" },
  "Creo soluciones significativamente nuevas": { puntaje: 4, dimension: "cognitiva" },
  "Genero innovaciones disruptivas sistemáticamente": { puntaje: 5, dimension: "cognitiva" },
  
  // Adaptabilidad
  "Me resisto a los cambios": { puntaje: 1, dimension: "cognitiva" },
  "Me adapto lentamente a cambios necesarios": { puntaje: 2, dimension: "cognitiva" },
  "Me ajusto adecuadamente a cambios previstos": { puntaje: 3, dimension: "cognitiva" },
  "Me adapto rápidamente a cambios inesperados": { puntaje: 4, dimension: "cognitiva" },
  "Anticipo y lidero cambios efectivamente": { puntaje: 5, dimension: "cognitiva" },

  // === CAPACIDADES INDIVIDUALES - TÉCNICAS ===
  // Prototipado y evaluación
  "No realizo prototipos": { puntaje: 1, dimension: "tecnica" },
  "Creo prototipos básicos con supervisión": { puntaje: 2, dimension: "tecnica" },
  "Desarrollo y evalúo prototipos independientemente": { puntaje: 3, dimension: "tecnica" },
  "Implemento estrategias complejas de prototipado": { puntaje: 4, dimension: "tecnica" },
  "Innovo en técnicas de prototipado y evaluación": { puntaje: 5, dimension: "tecnica" },
  
  // Dominio de metodologías UCD
  "No conozco metodologías de diseño centrado en usuario": { puntaje: 1, dimension: "tecnica" },
  "Aplico metodologías básicas con supervisión": { puntaje: 2, dimension: "tecnica" },
  "Utilizo metodologías comunes independientemente": { puntaje: 3, dimension: "tecnica" },
  "Adapto metodologías según necesidades específicas": { puntaje: 4, dimension: "tecnica" },
  "Desarrollo nuevos métodos y mejores prácticas": { puntaje: 5, dimension: "tecnica" },
  
  // Competencia en herramientas digitales
  "Uso herramientas básicas con dificultad": { puntaje: 1, dimension: "tecnica" },
  "Manejo herramientas comunes adecuadamente": { puntaje: 2, dimension: "tecnica" },
  "Utilizo herramientas avanzadas efectivamente": { puntaje: 3, dimension: "tecnica" },
  "Domino suites completas de herramientas": { puntaje: 4, dimension: "tecnica" },
  "Optimizo y expando el uso de herramientas": { puntaje: 5, dimension: "tecnica" },
  
  // Documentación de decisiones
  "No documento decisiones de diseño": { puntaje: 1, dimension: "tecnica" },
  "Documento decisiones básicas cuando se requiere": { puntaje: 2, dimension: "tecnica" },
  "Mantengo documentación regular y clara": { puntaje: 3, dimension: "tecnica" },
  "Desarrollo documentación comprensiva y estructurada": { puntaje: 4, dimension: "tecnica" },
  "Creo sistemas ejemplares de documentación": { puntaje: 5, dimension: "tecnica" },

  // === CAPACIDADES EMOCIONALES ===
  // Empatía
  "Me cuesta entender perspectivas ajenas": { puntaje: 1, dimension: "emocional" },
  "Reconozco necesidades evidentes de otros": { puntaje: 2, dimension: "emocional" },
  "Comprendo diferentes puntos de vista": { puntaje: 3, dimension: "emocional" },
  "Desarrollo profunda comprensión de otros": { puntaje: 4, dimension: "emocional" },
  "Anticipo y respondo a necesidades no expresadas": { puntaje: 5, dimension: "emocional" },
  
  // Resiliencia
  "Me frustro fácilmente ante obstáculos": { puntaje: 1, dimension: "emocional" },
  "Manejo contratiempos básicos con apoyo": { puntaje: 2, dimension: "emocional" },
  "Supero obstáculos comunes independientemente": { puntaje: 3, dimension: "emocional" },
  "Mantengo efectividad ante adversidad significativa": { puntaje: 4, dimension: "emocional" },
  "Transformo desafíos en oportunidades de crecimiento": { puntaje: 5, dimension: "emocional" },
  
  // Manejo del estrés
  "Me paralizo bajo presión": { puntaje: 1, dimension: "emocional" },
  "Manejo niveles básicos de estrés": { puntaje: 2, dimension: "emocional" },
  "Funciono adecuadamente bajo presión moderada": { puntaje: 3, dimension: "emocional" },
  "Mantengo alto rendimiento bajo presión significativa": { puntaje: 4, dimension: "emocional" },
  "Optimizo mi desempeño en situaciones de alta presión": { puntaje: 5, dimension: "emocional" },
  
  // Gestión emocional
  "No controlo mis reacciones emocionales": { puntaje: 1, dimension: "emocional" },
  "Manejo emociones básicas en situaciones comunes": { puntaje: 2, dimension: "emocional" },
  "Gestiono emociones efectivamente en la mayoría de casos": { puntaje: 3, dimension: "emocional" },
  "Mantengo equilibrio emocional en situaciones difíciles": { puntaje: 4, dimension: "emocional" },
  "Utilizo inteligencia emocional para potenciar resultados": { puntaje: 5, dimension: "emocional" },

  // === CAPACIDADES DE LIDERAZGO ===
  // Inspiración y motivación
  "No influyo en otros": { puntaje: 1, dimension: "liderazgo" },
  "Motivo ocasionalmente a compañeros cercanos": { puntaje: 2, dimension: "liderazgo" },
  "Inspiro regularmente a mi equipo inmediato": { puntaje: 3, dimension: "liderazgo" },
  "Motivo efectivamente a diversos grupos": { puntaje: 4, dimension: "liderazgo" },
  "Genero cambios transformacionales en otros": { puntaje: 5, dimension: "liderazgo" },
  
  // Toma de decisiones estratégicas
  "Evito tomar decisiones importantes": { puntaje: 1, dimension: "liderazgo" },
  "Tomo decisiones básicas con apoyo": { puntaje: 2, dimension: "liderazgo" },
  "Decido efectivamente en situaciones comunes": { puntaje: 3, dimension: "liderazgo" },
  "Tomo decisiones estratégicas complejas": { puntaje: 4, dimension: "liderazgo" },
  "Lidero decisiones transformacionales": { puntaje: 5, dimension: "liderazgo" },
  
  // Desarrollo de talento
  "Desarrollo de talento": { puntaje: 1, dimension: "liderazgo" },
  "Apoyo básicamente el desarrollo de compañeros": { puntaje: 2, dimension: "liderazgo" },
  "Contribuyo al crecimiento del equipo": { puntaje: 3, dimension: "liderazgo" },
  "Desarrollo sistemáticamente el talento": { puntaje: 4, dimension: "liderazgo" },
  "Creo líderes y mentores efectivos": { puntaje: 5, dimension: "liderazgo" },
  
  // Promoción de innovación
  "Me resisto a cambios e innovaciones": { puntaje: 1, dimension: "liderazgo" },
  "Acepto innovaciones necesarias": { puntaje: 2, dimension: "liderazgo" },
  "Apoyo iniciativas de innovación": { puntaje: 3, dimension: "liderazgo" },
  "Promuevo activamente la innovación": { puntaje: 4, dimension: "liderazgo" },
  "Creo cultura y sistemas de innovación": { puntaje: 5, dimension: "liderazgo" }
};

// Mapeo de dimensiones a índices para el array de resultados
const DIMENSION_INDEX_MAP = {
  "organizacional": 0,    // Capacidades Organizacionales
  "interpersonal": 1,     // Capacidades Interpersonales  
  "cognitiva": 2,         // Capacidades Individuales - Cognitivas
  "tecnica": 3,           // Capacidades Individuales - Técnicas
  "emocional": 4,         // Capacidades Emocionales
  "liderazgo": 5          // Capacidades de Liderazgo
};

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

// FUNCIÓN CORREGIDA DE PROCESAMIENTO DE RESPUESTAS
function processAnswers(formResponse) {
  try {
    console.log('Procesando respuestas con el modelo corregido...');
    
    // Filtrar solo las preguntas de opción múltiple
    const multipleChoiceAnswers = formResponse.answers.filter(answer => 
      answer && answer.type === 'choice'
    );

    console.log(`Procesando ${multipleChoiceAnswers.length} respuestas de opción múltiple`);

    // Inicializar arrays para almacenar puntajes por dimensión
    const dimensionScores = [0, 0, 0, 0, 0, 0]; // 6 dimensiones
    const dimensionQuestionCounts = [0, 0, 0, 0, 0, 0]; // Contador de preguntas por dimensión
    const processedAnswers = [];
    const unmatchedAnswers = [];

    // Procesar cada respuesta
    multipleChoiceAnswers.forEach((answer, index) => {
      const responseText = answer.choice.label;
      const scoringInfo = RESPONSE_SCORING_MAP[responseText];
      
      if (scoringInfo) {
        processedAnswers.push({
          questionIndex: index,
          response: responseText,
          score: scoringInfo.puntaje,
          dimension: scoringInfo.dimension
        });
        
        // Solo sumar si no es la dimensión "ninguna" (primera pregunta)
        if (scoringInfo.dimension !== "ninguna") {
          const dimensionIndex = DIMENSION_INDEX_MAP[scoringInfo.dimension];
          if (dimensionIndex !== undefined) {
            dimensionScores[dimensionIndex] += scoringInfo.puntaje;
            dimensionQuestionCounts[dimensionIndex]++;
          }
        }
      } else {
        unmatchedAnswers.push({
          questionIndex: index,
          response: responseText
        });
        console.warn(`Respuesta no encontrada en el mapa: "${responseText}"`);
      }
    });

    // Log de depuración
    console.log('Respuestas procesadas:', processedAnswers.length);
    console.log('Respuestas no coincidentes:', unmatchedAnswers.length);
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

    console.log('Puntaje total raw:', totalRawScore, '/ 120');
    console.log('Puntaje total porcentaje:', totalPercentage.toFixed(1), '%');
    console.log('Dimensiones en porcentaje:', dimensionPercentages.map(p => p.toFixed(1) + '%'));

    return {
      dimensionScores: dimensionPercentages,
      totalScore: totalPercentage,
      masteryLevel,
      rawScores: processedAnswers,
      unmatchedAnswers,
      debugInfo: {
        totalRawScore,
        dimensionRawScores: dimensionScores,
        dimensionQuestionCounts
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
