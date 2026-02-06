/**
 * Run SQL via Supabase REST API (limited operations) or provide instructions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUseCaseColumn() {
  console.log('Checking if use_case column exists...\n');

  // Try to select use_case - if it errors, column doesn't exist
  const { data, error } = await supabase
    .from('listings')
    .select('use_case')
    .limit(1);

  if (error && error.message.includes('column listings.use_case does not exist')) {
    console.log('❌ Column does not exist. Please run this SQL in Supabase Dashboard:\n');
    console.log('   https://supabase.com/dashboard/project/cmcndptzwsussurxxqqq/sql/new\n');
    console.log('   SQL:');
    console.log('   ─────────────────────────────────────────');
    console.log('   ALTER TABLE listings');
    console.log('   ADD COLUMN IF NOT EXISTS use_case VARCHAR(80);');
    console.log('   ─────────────────────────────────────────\n');
    return false;
  }

  if (error) {
    console.error('Error:', error);
    return false;
  }

  console.log('✅ Column use_case already exists!');
  return true;
}

addUseCaseColumn();
