import { sql } from '@vercel/postgres';

export async function migrate() {
  try {
    // Crear tabla de resultados
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        response_id TEXT NOT NULL UNIQUE,
        total_score FLOAT NOT NULL,
        mastery_level JSONB NOT NULL,
        dimension_scores JSONB NOT NULL,
        recommendations JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`${createTableQuery}`;
    console.log('Migración ejecutada exitosamente');
  } catch (error) {
    console.error('Error en la migración:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrate().catch(console.error);
}
