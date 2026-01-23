-- Create pages table for editable content (Terms, Privacy, FAQ, etc.)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pages
INSERT INTO pages (slug, title, content, meta_description) VALUES
('terms', 'Terms of Service', '<h2>Terms of Service</h2><p>Welcome to NotRenewing. By using our service, you agree to these terms.</p><h3>1. Acceptance of Terms</h3><p>By accessing or using NotRenewing, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p><h3>2. Domain Listings</h3><p>Sellers must own or have authorization to sell any domains listed on our platform. All domains are sold at a fixed price of $99.</p><h3>3. Verification</h3><p>Sellers must verify domain ownership through DNS TXT record verification before listings become active.</p><h3>4. Transfers</h3><p>Sellers have 72 hours to initiate domain transfer after a sale. Failure to transfer may result in refund to buyer and account penalties.</p><h3>5. Payments</h3><p>All payments are processed through Stripe. Sellers receive payouts weekly after successful domain transfers.</p><h3>6. Disputes</h3><p>Buyers may open disputes within 7 days if domain transfer is not completed. Our team will review and resolve disputes fairly.</p><h3>7. Prohibited Content</h3><p>Domains that infringe trademarks, promote illegal activity, or violate third-party rights are not allowed.</p><h3>8. Account Termination</h3><p>We reserve the right to suspend or terminate accounts that violate these terms.</p><h3>9. Limitation of Liability</h3><p>NotRenewing is not liable for any indirect, incidental, or consequential damages arising from use of our service.</p><h3>10. Changes to Terms</h3><p>We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>', 'Terms of Service for NotRenewing domain marketplace'),
('privacy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p><h3>1. Information We Collect</h3><p><strong>Account Information:</strong> Email address, name, and payment details when you register as a seller.</p><p><strong>Transaction Data:</strong> Domain listings, purchases, and payment history.</p><p><strong>Usage Data:</strong> Pages visited, features used, and interactions with our service.</p><h3>2. How We Use Your Information</h3><p>We use your information to:</p><ul><li>Process domain listings and sales</li><li>Send transaction notifications and updates</li><li>Improve our service and user experience</li><li>Prevent fraud and ensure security</li></ul><h3>3. Information Sharing</h3><p>We share information only:</p><ul><li>With payment processors (Stripe) to process transactions</li><li>With buyers/sellers to facilitate domain transfers</li><li>When required by law or to protect our rights</li></ul><h3>4. Data Security</h3><p>We implement industry-standard security measures to protect your data, including encryption and secure servers.</p><h3>5. Cookies</h3><p>We use cookies to maintain sessions and improve user experience. You can disable cookies in your browser settings.</p><h3>6. Your Rights</h3><p>You can request access to, correction of, or deletion of your personal data by contacting us.</p><h3>7. Contact Us</h3><p>For privacy questions, contact us at privacy@notrenewing.com</p>', 'Privacy Policy for NotRenewing domain marketplace'),
('faq', 'Frequently Asked Questions', '<h2>Frequently Asked Questions</h2><h3>For Buyers</h3><h4>How much do domains cost?</h4><p>All domains on NotRenewing are sold at a fixed price of $99.</p><h4>Do I need an account to buy?</h4><p>No, buyers can purchase as guests using just their email address.</p><h4>How long does transfer take?</h4><p>Sellers have 72 hours to initiate the transfer after purchase. Most transfers complete within 24-48 hours.</p><h4>What if I don''t receive my domain?</h4><p>You can open a dispute within 7 days. If the seller fails to transfer, you''ll receive a full refund.</p><h3>For Sellers</h3><h4>How do I list a domain?</h4><p>Sign up, submit your domain, pay the $1 listing fee, and verify ownership via DNS TXT record.</p><h4>What are the requirements?</h4><p>Domains must be at least 24 months old and expiring within 12 months.</p><h4>How long are listings active?</h4><p>Listings are active for 30 days. You can relist for an additional $1.</p><h4>When do I get paid?</h4><p>Payouts are processed weekly after the buyer confirms receipt of the domain.</p><h4>What''s the listing fee?</h4><p>There''s a $1 non-refundable listing fee per domain to prevent spam.</p><h3>General</h3><h4>How does verification work?</h4><p>Add a TXT record to your domain''s DNS with the token we provide. This proves you control the domain.</p><h4>What TLDs are supported?</h4><p>Currently .com, .net, .org, .io, and .ai. More coming soon!</p><h4>How is the AI score calculated?</h4><p>Our AI evaluates domains based on length, memorability, brandability, and commercial appeal.</p>', 'Frequently Asked Questions about NotRenewing domain marketplace')
ON CONFLICT (slug) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();
