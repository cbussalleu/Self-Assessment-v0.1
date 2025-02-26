import { sql } from '@vercel/postgres';

export async function createAssessmentResult(results) {
  try {
    // Log de depuración para ver las credenciales que se están usando
    console.log('Database connection info:', {
      host: process.env.POSTGRES_HOST || 'not set',
      user: process.env.POSTGRES_USER || 'not set',
      database: process.env.POSTGRES_DATABASE || 'not set',
      // No loguees la contraseña real por seguridad
      passwordSet: process.env.POSTGRES_PASSWORD ? 'yes' : 'no'
    });

    const {
      response_id,
      responseId,
      totalScore,
      total_score,
      masteryLevel,
      mastery_level,
      dimensionScores,
      dimension_scores,
      recommendations
    } = results;

    // Usar cualquier versión del ID que esté disponible
    const finalResponseId = response_id || responseId;
    const finalTotalScore = totalScore || total_score || 0;
    const finalMasteryLevel = masteryLevel || mastery_level || { level: 1, description: "Principiante" };
    const finalDimensionScores = dimensionScores || dimension_scores || [0,0,0,0,0,0];
    
    if (!finalResponseId) {
      throw new Error('Response ID is required');
    }

    console.log('Saving to database:', {
      responseId: finalResponseId,
      totalScore: finalTotalScore,
      masteryLevel: JSON.stringify(finalMasteryLevel),
      dimensionScores: JSON.stringify(finalDimensionScores)
    });

    const query = `
      INSERT INTO assessment_results 
      (response_id, total_score, mastery_level, dimension_scores, recommendations, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (response_id) DO UPDATE 
      SET 
        total_score = EXCLUDED.total_score,
        mastery_level = EXCLUDED.mastery_level,
        dimension_scores = EXCLUDED.dimension_scores,
        recommendations = EXCLUDED.recommendations,
        created_at = NOW()
      RETURNING *
    `;
    
    const values = [
      responseId,
      totalScore,
      JSON.stringify(masteryLevel),
      JSON.stringify(dimensionScores),
      JSON.stringify(recommendations)
    ];
    
    const result = await sql.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Detailed error creating assessment result:', {
      message: error.message,
      stack: error.stack,
      results: results
    });
    throw error;
  }
}

export async function getAssessmentResultByResponseId(responseId) {
  try {
    if (!responseId) {
      throw new Error('Response ID is required');
    }

    console.log('Looking for results with responseId:', responseId);
    
    const query = `
      SELECT 
        response_id, 
        total_score, 
        mastery_level, 
        dimension_scores, 
        recommendations,
        created_at
      FROM assessment_results
      WHERE response_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await sql.query(query, [responseId]);
    
    console.log('Database query result:', {
      found: result.rows.length > 0,
      data: result.rows[0] ? {
        ...result.rows[0],
        mastery_level: JSON.parse(result.rows[0].mastery_level),
        dimension_scores: JSON.parse(result.rows[0].dimension_scores),
        recommendations: JSON.parse(result.rows[0].recommendations)
      } : null
    });
    
    return result.rows[0] ? {
      ...result.rows[0],
      masteryLevel: JSON.parse(result.rows[0].mastery_level),
      dimensionScores: JSON.parse(result.rows[0].dimension_scores),
      recommendations: JSON.parse(result.rows[0].recommendations)
    } : null;
  } catch (error) {
    console.error('Detailed error fetching assessment result:', {
      message: error.message,
      stack: error.stack,
      responseId: responseId
    });
    throw error;
  }
}
