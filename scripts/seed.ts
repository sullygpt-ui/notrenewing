import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const sampleDomains = [
  // High tier - brandable, short, .com
  { domain_name: 'snapflow.com', tld: 'com', ai_score: 92, ai_tier: 'high' },
  { domain_name: 'cloudpeak.io', tld: 'io', ai_score: 88, ai_tier: 'high' },
  { domain_name: 'mintbase.com', tld: 'com', ai_score: 85, ai_tier: 'high' },
  { domain_name: 'bytehub.io', tld: 'io', ai_score: 84, ai_tier: 'high' },
  { domain_name: 'nextera.ai', tld: 'ai', ai_score: 82, ai_tier: 'high' },
  { domain_name: 'pulsetech.com', tld: 'com', ai_score: 80, ai_tier: 'high' },

  // Medium tier - decent names
  { domain_name: 'quicklaunch.net', tld: 'net', ai_score: 68, ai_tier: 'medium' },
  { domain_name: 'datastream.org', tld: 'org', ai_score: 65, ai_tier: 'medium' },
  { domain_name: 'smartledger.io', tld: 'io', ai_score: 62, ai_tier: 'medium' },
  { domain_name: 'greenpath.com', tld: 'com', ai_score: 60, ai_tier: 'medium' },
  { domain_name: 'urbanspace.net', tld: 'net', ai_score: 58, ai_tier: 'medium' },
  { domain_name: 'blueocean.ai', tld: 'ai', ai_score: 55, ai_tier: 'medium' },
  { domain_name: 'techforge.io', tld: 'io', ai_score: 52, ai_tier: 'medium' },
  { domain_name: 'pixelcraft.com', tld: 'com', ai_score: 50, ai_tier: 'medium' },

  // Low tier - functional but not remarkable
  { domain_name: 'web-services-hub.net', tld: 'net', ai_score: 35, ai_tier: 'low' },
  { domain_name: 'digital-tools-online.com', tld: 'com', ai_score: 32, ai_tier: 'low' },
  { domain_name: 'mybusiness-portal.org', tld: 'org', ai_score: 28, ai_tier: 'low' },
  { domain_name: 'tech-solutions-123.net', tld: 'net', ai_score: 25, ai_tier: 'low' },
];

async function seed() {
  console.log('Starting seed...');

  // Create a demo seller user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo-seller@notrenewing.com',
    password: 'demo-password-123',
    email_confirm: true,
  });

  if (authError && !authError.message.includes('already been registered')) {
    console.error('Error creating user:', authError);
    return;
  }

  let sellerId: string;

  if (authData?.user) {
    sellerId = authData.user.id;
    console.log('Created demo user:', sellerId);
  } else {
    // User might already exist, fetch them
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find(u => u.email === 'demo-seller@notrenewing.com');
    if (existingUser) {
      sellerId = existingUser.id;
      console.log('Using existing demo user:', sellerId);
    } else {
      console.error('Could not find or create demo user');
      return;
    }
  }

  // Insert sample listings
  const now = new Date();
  const listings = sampleDomains.map((domain, index) => ({
    seller_id: sellerId,
    domain_name: domain.domain_name,
    tld: domain.tld,
    status: 'active',
    ai_score: domain.ai_score,
    ai_tier: domain.ai_tier,
    ai_scored_at: now.toISOString(),
    verified_at: now.toISOString(),
    listed_at: new Date(now.getTime() - index * 3600000).toISOString(), // Stagger listing times
    expires_at: new Date(now.getTime() + 30 * 24 * 3600000).toISOString(),
    domain_age_months: Math.floor(Math.random() * 60) + 12, // 12-72 months
    expiration_date: new Date(now.getTime() + (Math.random() * 10 + 2) * 30 * 24 * 3600000).toISOString().split('T')[0],
    registrar: ['GoDaddy', 'Namecheap', 'Cloudflare', 'Google Domains', 'Porkbun'][Math.floor(Math.random() * 5)],
    is_sponsored: index < 2, // First 2 are sponsored
    sponsored_until: index < 2 ? new Date(now.getTime() + 7 * 24 * 3600000).toISOString() : null,
  }));

  const { data, error } = await supabase
    .from('listings')
    .upsert(listings, { onConflict: 'domain_name' })
    .select();

  if (error) {
    console.error('Error inserting listings:', error);
    return;
  }

  console.log(`Inserted ${data?.length || 0} sample listings`);
  console.log('Seed complete!');
}

seed().catch(console.error);
