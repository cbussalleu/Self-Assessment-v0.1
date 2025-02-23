import { sql } from '@vercel/postgres';

export async function createAssessmentResult(results) {
  try {
    const {
      responseId,
      totalScore,
      masteryLevel,
      dimensionScores,
      recommendations
    } = results;

    const query = `
      INSERT INTO assessment_results
      (response_id, total_score, mastery_level, dimension_scores, recommendations)
      VALUES ($1, $2, $3, $4, $5)
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
    console.error('Error creating assessment result:', error);
    throw error;
  }
}

export async function getAssessmentResultByResponseId(responseId) {
  try {
    const query = `
      SELECT * FROM assessment_results
      WHERE response_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await sql.query(query, [responseId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching assessment result:', error);
    throw error;
  }
}
