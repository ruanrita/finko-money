import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying migration to production...');
  console.log('Supabase URL:', supabaseUrl);

  // Read migration file
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20251130000001_fix_features_rls.sql');
  const migration = fs.readFileSync(migrationPath, 'utf-8');

  console.log('\n=== Migration SQL ===');
  console.log(migration);
  console.log('\n====================\n');

  // Split migration into individual statements
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
    console.log(statement.substring(0, 100) + '...');

    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

    if (error) {
      console.error('❌ Error:', error);
      // Continue even if there are errors (some DROP statements might fail if policy doesn't exist)
      if (!statement.startsWith('DROP POLICY')) {
        console.error('⚠️ Non-DROP statement failed! This might be a problem.');
      }
    } else {
      console.log('✅ Success');
    }
  }

  console.log('\n=== Migration completed ===');

  // Test if it worked
  console.log('\n=== Testing features access ===');
  const { data: features, error: featuresError } = await supabase
    .from('features')
    .select('*')
    .limit(3);

  if (featuresError) {
    console.error('❌ Still getting error:', featuresError);
  } else {
    console.log('✅ Features accessible!', features?.length, 'features found');
  }
}

applyMigration().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
