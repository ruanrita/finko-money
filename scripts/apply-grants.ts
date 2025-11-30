import { config } from 'dotenv';
import { Client } from 'pg';
import path from 'path';
import fs from 'fs';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.SUPABASE_DB_URL!;

async function applyGrants() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Applying GRANT statements...\n');

  const sql = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/20251130000003_grant_table_access.sql'),
    'utf-8'
  );

  try {
    await client.query(sql);
    console.log('✅ GRANT statements applied successfully!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await client.end();
}

applyGrants().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
