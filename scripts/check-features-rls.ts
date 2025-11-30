import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRLS() {
  console.log('Checking RLS policies for features table...');
  console.log('Supabase URL:', supabaseUrl);

  // Try to query features table directly with service role
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .limit(5);

  console.log('\n=== Direct Query Result ===');
  console.log('Error:', error);
  console.log('Data:', data);

  // Check if RLS is enabled
  const { data: rlsCheck, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('features', 'plan_features', 'subscription_plans');
    `
  });

  console.log('\n=== RLS Status ===');
  console.log('Error:', rlsError);
  console.log('Data:', rlsCheck);
}

checkRLS().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
