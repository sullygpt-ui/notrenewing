-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'homepage',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Index for email lookups
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Index for active subscribers
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(subscribed_at)
  WHERE unsubscribed_at IS NULL;
