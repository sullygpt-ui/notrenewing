-- Users profile (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  paypal_email TEXT,
  payout_method TEXT CHECK (payout_method IN ('stripe', 'paypal')),
  reliability_score INTEGER DEFAULT 100,
  is_suspended BOOLEAN DEFAULT FALSE,
  monthly_listing_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Domain Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  registrar TEXT,

  -- Verification
  verification_token TEXT,
  verified_at TIMESTAMPTZ,

  -- Domain metadata
  domain_age_months INTEGER,
  expiration_date DATE,

  -- AI Scoring
  ai_score FLOAT,
  ai_tier TEXT CHECK (ai_tier IN ('high', 'medium', 'low')),
  ai_scored_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending_verification' CHECK (status IN (
    'pending_verification', 'active', 'paused', 'sold', 'expired', 'removed'
  )),

  -- Sponsorship
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsored_until TIMESTAMPTZ,

  -- Admin
  admin_featured BOOLEAN DEFAULT FALSE,
  admin_hidden BOOLEAN DEFAULT FALSE,

  -- Timestamps
  listed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(domain_name)
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status = 'active' AND admin_hidden = FALSE);

CREATE POLICY "Sellers can view own listings" ON listings
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Indexes for listings
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_tld ON listings(tld);
CREATE INDEX idx_listings_ai_score ON listings(ai_score DESC);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_domain_name ON listings(domain_name);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  buyer_email TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL,
  processing_fee INTEGER,
  seller_payout INTEGER,
  transfer_status TEXT DEFAULT 'pending' CHECK (transfer_status IN (
    'pending', 'in_progress', 'completed', 'failed', 'disputed'
  )),
  transfer_deadline TIMESTAMPTZ,
  transfer_confirmed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_outcome TEXT CHECK (dispute_outcome IN ('buyer_refunded', 'seller_paid', 'admin_decision')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Purchases policies
CREATE POLICY "Sellers can view purchases of their listings" ON purchases
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE seller_id = auth.uid())
  );

-- Indexes for purchases
CREATE INDEX idx_purchases_listing_id ON purchases(listing_id);
CREATE INDEX idx_purchases_transfer_status ON purchases(transfer_status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT,
  stripe_transfer_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Payouts policies
CREATE POLICY "Sellers can view own payouts" ON payouts
  FOR SELECT USING (auth.uid() = seller_id);

-- Indexes for payouts
CREATE INDEX idx_payouts_seller_id ON payouts(seller_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Listing fees
CREATE TABLE listing_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  domain_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE listing_fees ENABLE ROW LEVEL SECURITY;

-- Listing fees policies
CREATE POLICY "Sellers can view own listing fees" ON listing_fees
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert listing fees" ON listing_fees
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Domain engagement
CREATE TABLE domain_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'save', 'click')),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read for analytics)
ALTER TABLE domain_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert engagement" ON domain_engagement
  FOR INSERT WITH CHECK (TRUE);

-- Indexes for engagement
CREATE INDEX idx_engagement_listing_id ON domain_engagement(listing_id);
CREATE INDEX idx_engagement_created_at ON domain_engagement(created_at DESC);
