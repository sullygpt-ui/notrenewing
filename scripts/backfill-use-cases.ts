/**
 * Backfill use-cases for existing domains that don't have one
 * 
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/backfill-use-cases.ts
 * 
 * Or via npm:
 *   npm run backfill-use-cases
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!anthropicApiKey) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

const USE_CASE_PROMPT = `You generate very short, punchy use-case suggestions for domain names. Think of it as a one-liner pitch for who would want this domain.

Rules:
- Maximum 60 characters
- Be specific and creative
- Focus on the business/brand opportunity
- No generic phrases like "great for" or "perfect for"
- Start with an action verb or specific industry/use
- Make it intriguing

Examples:
- "startup.io" → "Launch your next unicorn"
- "health.app" → "Wellness tracking made personal"
- "cloud.net" → "Enterprise infrastructure branding"
- "pizza.co" → "Local delivery empire awaits"
- "legal.io" → "LegalTech SaaS platform"

Respond with ONLY the use-case text, nothing else. No quotes, no explanation.`;

async function generateUseCase(domainName: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${USE_CASE_PROMPT}\n\nDomain: ${domainName}`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Clean up and truncate
    let useCase = responseText.trim().replace(/^["']|["']$/g, '');
    if (useCase.length > 80) {
      useCase = useCase.substring(0, 77) + '...';
    }
    
    return useCase;
  } catch (error) {
    console.error(`Error generating use-case for ${domainName}:`, error);
    return '';
  }
}

async function backfillUseCases() {
  console.log('🚀 Starting use-case backfill...\n');

  // Fetch all listings without a use-case
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, domain_name, use_case')
    .is('use_case', null)
    .in('status', ['active', 'pending_verification', 'pending_payment'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    process.exit(1);
  }

  if (!listings || listings.length === 0) {
    console.log('✅ All listings already have use-cases!');
    return;
  }

  console.log(`Found ${listings.length} listings without use-cases\n`);

  let successCount = 0;
  let failCount = 0;

  // Process in batches to avoid rate limits
  const batchSize = 5;
  const delayMs = 1000; // 1 second delay between batches

  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)}...`);

    const promises = batch.map(async (listing) => {
      const useCase = await generateUseCase(listing.domain_name);
      
      if (useCase) {
        const { error: updateError } = await supabase
          .from('listings')
          .update({ use_case: useCase })
          .eq('id', listing.id);

        if (updateError) {
          console.error(`  ❌ ${listing.domain_name}: Failed to save - ${updateError.message}`);
          failCount++;
        } else {
          console.log(`  ✅ ${listing.domain_name}: "${useCase}"`);
          successCount++;
        }
      } else {
        console.error(`  ❌ ${listing.domain_name}: No use-case generated`);
        failCount++;
      }
    });

    await Promise.all(promises);

    // Delay between batches
    if (i + batchSize < listings.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📝 Total: ${listings.length}`);
}

backfillUseCases().catch(console.error);
