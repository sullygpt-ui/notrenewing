-- Add use_case column to listings table
-- This stores an AI-generated or seller-edited short pitch for the domain

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS use_case VARCHAR(80);

-- Add comment for documentation
COMMENT ON COLUMN listings.use_case IS 'AI-generated or seller-edited use-case/pitch for the domain (max 80 chars)';
