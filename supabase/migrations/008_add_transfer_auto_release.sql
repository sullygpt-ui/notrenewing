-- Add fields for seller-initiated transfer and auto-release
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS transfer_initiated_at TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS auth_code TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS transfer_notes TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS buyer_confirmation_deadline TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS auto_released BOOLEAN DEFAULT FALSE;

-- Add index for cron job to efficiently find expired transfers
CREATE INDEX IF NOT EXISTS idx_purchases_auto_release
ON purchases (buyer_confirmation_deadline)
WHERE transfer_status = 'pending'
AND transfer_initiated_at IS NOT NULL
AND buyer_confirmation_deadline IS NOT NULL;
