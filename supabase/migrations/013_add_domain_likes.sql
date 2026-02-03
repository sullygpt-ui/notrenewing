-- Domain Likes table
-- Tracks user likes on domain listings

CREATE TABLE domain_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For anonymous likes (optional, track by session)
  ip_hash TEXT, -- Hashed IP for anonymous rate limiting
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate likes from same user
  UNIQUE(listing_id, user_id),
  -- Prevent duplicate anonymous likes from same session
  UNIQUE(listing_id, session_id)
);

-- Index for fast lookups
CREATE INDEX idx_domain_likes_listing_id ON domain_likes(listing_id);
CREATE INDEX idx_domain_likes_user_id ON domain_likes(user_id);

-- Add like_count to listings for fast querying (denormalized)
ALTER TABLE listings ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

-- Function to update like count
CREATE OR REPLACE FUNCTION update_listing_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET like_count = like_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET like_count = like_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update like count
CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON domain_likes
FOR EACH ROW
EXECUTE FUNCTION update_listing_like_count();

-- RLS policies
ALTER TABLE domain_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes (for count display)
CREATE POLICY "Anyone can view likes" ON domain_likes
  FOR SELECT USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can like domains" ON domain_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own likes
CREATE POLICY "Users can unlike domains" ON domain_likes
  FOR DELETE USING (auth.uid() = user_id);
