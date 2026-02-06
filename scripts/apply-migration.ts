/**
 * Apply a SQL migration directly via Supabase
 * 
 * Usage:
 *   npx tsx scripts/apply-migration.ts 014_add_use_case.sql
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function applyMigration(filename: string) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`Applying migration: ${filename}\n`);
  console.log('SQL:', sql);
  console.log('\n');

  // Use rpc to execute raw SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If exec_sql doesn't exist, we need to run it another way
    console.error('Error:', error.message);
    console.log('\nNote: You may need to run this migration manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/cmcndptzwsussurxxqqq/sql/new');
    console.log('\nSQL to run:');
    console.log(sql);
    process.exit(1);
  }

  console.log('Migration applied successfully!');
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: npx tsx scripts/apply-migration.ts <migration-file.sql>');
  process.exit(1);
}

applyMigration(migrationFile).catch(console.error);
