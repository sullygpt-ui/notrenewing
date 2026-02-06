import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Adding use_case column to listings table...\n');

  // Use Supabase's SQL execution via RPC - need to create a function first
  // Alternative: use the Data API to check if column exists
  
  // First, let's test if the column already exists
  const { data, error } = await supabase
    .from('listings')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error connecting:', error.message);
    return;
  }

  // Try to update a non-existent row with use_case to test if column exists
  const { error: testError } = await supabase
    .from('listings')
    .update({ use_case: 'test' })
    .eq('id', '00000000-0000-0000-0000-000000000000');

  if (testError && testError.message.includes('column "use_case" of relation "listings" does not exist')) {
    console.log('Column does not exist. Creating via direct API...\n');
    
    // Extract project ref from URL
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    
    // Use Supabase Management API
    const response = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        query: "ALTER TABLE listings ADD COLUMN IF NOT EXISTS use_case VARCHAR(80);"
      }),
    });

    if (!response.ok) {
      // RPC doesn't exist, need another approach
      console.log('Direct SQL not available via REST API.');
      console.log('Attempting via database connection...');
    }
  } else if (testError) {
    console.log('Column likely exists (different error):', testError.message);
  } else {
    console.log('✅ Column use_case already exists!');
  }
}

runMigration();
