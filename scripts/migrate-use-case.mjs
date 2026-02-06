import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const projectRef = 'cmcndptzwsussurxxqqq';

// Try Supabase's direct connection (requires database password)
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.cmcndptzwsussurxxqqq.supabase.co:5432/postgres

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('DATABASE_URL not found in .env.local');
  console.log('');
  console.log('To connect directly, add this to .env.local:');
  console.log('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.cmcndptzwsussurxxqqq.supabase.co:5432/postgres');
  console.log('');
  console.log('You can find your database password in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/cmcndptzwsussurxxqqq/settings/database');
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const sql = 'ALTER TABLE listings ADD COLUMN IF NOT EXISTS use_case VARCHAR(80);';
    console.log('Running:', sql);
    
    await client.query(sql);
    console.log('✅ Migration successful! Column use_case added.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
