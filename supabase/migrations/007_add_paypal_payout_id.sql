-- Add PayPal payout ID column to payouts table
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS paypal_payout_id TEXT;
