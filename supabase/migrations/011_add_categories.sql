-- Add category field to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT;

-- Create categories table for reference
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (slug, name, description, icon, sort_order) VALUES
  ('tech', 'Technology', 'Software, SaaS, apps, and tech startups', '💻', 1),
  ('finance', 'Finance & Crypto', 'Banking, fintech, cryptocurrency, and trading', '💰', 2),
  ('health', 'Health & Wellness', 'Healthcare, fitness, medical, and wellness', '🏥', 3),
  ('ecommerce', 'E-Commerce', 'Online stores, retail, and shopping', '🛒', 4),
  ('ai', 'AI & Machine Learning', 'Artificial intelligence and ML projects', '🤖', 5),
  ('marketing', 'Marketing & SEO', 'Digital marketing, SEO, and advertising', '📈', 6),
  ('education', 'Education', 'Learning, courses, and educational content', '📚', 7),
  ('gaming', 'Gaming', 'Video games, esports, and gaming communities', '🎮', 8),
  ('media', 'Media & Entertainment', 'News, podcasts, video, and entertainment', '🎬', 9),
  ('real-estate', 'Real Estate', 'Property, housing, and real estate services', '🏠', 10),
  ('travel', 'Travel & Hospitality', 'Tourism, hotels, and travel services', '✈️', 11),
  ('food', 'Food & Beverage', 'Restaurants, recipes, and food delivery', '🍔', 12),
  ('business', 'Business Services', 'B2B, consulting, and professional services', '💼', 13),
  ('other', 'Other', 'Domains that don''t fit other categories', '📦', 99)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
