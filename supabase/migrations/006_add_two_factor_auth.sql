-- Add two-factor authentication support
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_verified_at TIMESTAMP WITH TIME ZONE;

-- Backup codes for 2FA recovery
CREATE TABLE IF NOT EXISTS backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON backup_codes(user_id);

-- RLS policies for backup_codes
ALTER TABLE backup_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup codes"
  ON backup_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup codes"
  ON backup_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backup codes"
  ON backup_codes FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert backup codes
CREATE POLICY "Service role can insert backup codes"
  ON backup_codes FOR INSERT
  WITH CHECK (true);
