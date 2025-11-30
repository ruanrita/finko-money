import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking tables in production...');
  console.log('Supabase URL:', supabaseUrl);

  const tablesToCheck = [
    'verification_codes',
    'email_logs',
    'features',
    'plan_features',
    'subscription_plans',
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    console.log(`\n${table}:`);
    if (error) {
      console.log('❌ Error:', error.code, '-', error.message);
    } else {
      console.log('✅ Exists and accessible');
    }
  }
}

checkTables().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
