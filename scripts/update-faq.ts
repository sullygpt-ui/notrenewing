import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

const newContent = `<h3>For Buyers</h3>
<h4>How much do domains cost?</h4>
<p>All domains on NotRenewing are sold at a fixed price of $99. No auctions, no negotiations - just simple, transparent pricing.</p>

<h4>Do I need an account to buy a domain?</h4>
<p>No, you can purchase domains as a guest using just your email address. You'll receive all transfer instructions via email.</p>

<h4>How long does the domain transfer take?</h4>
<p>Sellers have 72 hours to initiate the transfer after your purchase. Most transfers complete within 24-48 hours after initiation.</p>

<h4>What if I don't receive my domain?</h4>
<p>You can open a dispute within 7 days of purchase. If the seller fails to transfer the domain, you'll receive a full refund.</p>

<h4>What payment methods are accepted?</h4>
<p>We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.</p>

<h3>For Sellers</h3>
<h4>How do I list a domain for sale?</h4>
<p>Sign up for a seller account, submit your domain, pay the $1 listing fee, and verify ownership via DNS TXT record.</p>

<h4>What are the domain requirements?</h4>
<p>Domains must be at least 24 months old and expiring within 12 months. This ensures quality listings from motivated sellers.</p>

<h4>How long are listings active?</h4>
<p>Listings are active for 30 days. You can relist for an additional $1 if your domain doesn't sell.</p>

<h4>When do I get paid?</h4>
<p>Payouts are processed weekly after the buyer confirms receipt of the domain, typically 7-10 days after the sale.</p>

<h4>What's the listing fee for?</h4>
<p>The $1 non-refundable listing fee helps prevent spam and ensures serious sellers. It covers 30 days of listing.</p>

<h4>What is the seller payout amount?</h4>
<p>Sellers receive $99 per sale minus payment processing fees. When we receive payment from the buyer, standard Stripe fees apply. When we send your payout, any applicable Stripe or PayPal fees are deducted. You can choose to receive payouts via Stripe (direct to bank) or PayPal in your dashboard settings.</p>

<h3>Verification & Transfer</h3>
<h4>How does domain verification work?</h4>
<p>After submitting your domain, you'll receive a unique verification token. Add this as a TXT record to your domain's DNS settings to prove ownership.</p>

<h4>Which TLDs are supported?</h4>
<p>Currently we support .com, .net, .org, .io, and .ai domains. More TLDs coming soon!</p>

<h4>How do I transfer a domain after it sells?</h4>
<p>You'll receive an email with the buyer's information. Initiate the transfer through your registrar and provide the auth code to the buyer.</p>`;

async function main() {
  const { error } = await supabase
    .from('pages')
    .update({ content: newContent })
    .eq('slug', 'faq');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('FAQ updated successfully - AI Scoring section removed');
  }
}

main();
