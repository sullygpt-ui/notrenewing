-- Add staff_pick column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS staff_pick BOOLEAN DEFAULT false;

-- Update CoolBars.com as a staff pick for testing
UPDATE listings SET staff_pick = true WHERE LOWER(domain_name) = 'coolbars.com';
