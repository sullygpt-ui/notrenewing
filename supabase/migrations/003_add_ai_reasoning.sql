-- Add ai_reasoning column to store AI scoring explanation
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;

-- Add comment for documentation
COMMENT ON COLUMN listings.ai_reasoning IS 'AI-generated explanation for the domain score';
