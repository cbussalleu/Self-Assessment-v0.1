CREATE TABLE assessment_results (
  id SERIAL PRIMARY KEY,
  response_id TEXT NOT NULL UNIQUE,
  total_score FLOAT NOT NULL,
  mastery_level JSONB NOT NULL,
  dimension_scores JSONB NOT NULL,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
