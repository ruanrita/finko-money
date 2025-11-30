import { config } from 'dotenv';
import { Client } from 'pg';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.SUPABASE_DB_URL!;

async function checkPolicies() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Checking RLS policies in production...\n');

  // Check if RLS is enabled on tables
  const rlsQuery = `
    SELECT
      schemaname,
      tablename,
      rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('features', 'plan_features', 'subscription_plans', 'verification_codes', 'email_logs')
    ORDER BY tablename;
  `;

  const rlsResult = await client.query(rlsQuery);
  console.log('=== RLS Status ===');
  console.table(rlsResult.rows);

  // Check policies
  const policiesQuery = `
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('features', 'plan_features', 'subscription_plans', 'verification_codes', 'email_logs')
    ORDER BY tablename, policyname;
  `;

  const policiesResult = await client.query(policiesQuery);
  console.log('\n=== Policies ===');
  if (policiesResult.rows.length === 0) {
    console.log('⚠️ NO POLICIES FOUND!');
  } else {
    policiesResult.rows.forEach(policy => {
      console.log(`\nTable: ${policy.tablename}`);
      console.log(`  Policy: ${policy.policyname}`);
      console.log(`  Command: ${policy.cmd}`);
      console.log(`  Roles: ${policy.roles}`);
    });
  }

  await client.end();
}

checkPolicies().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
