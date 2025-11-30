import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  console.log('Listing users in production...');
  console.log('Supabase URL:', supabaseUrl);

  const { data, error } = await supabase
    .from('users')
    .select('id, email, is_admin, is_early_adopter, subscription_plan_id')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== Users in Production ===');
  console.log('Total users:', data?.length || 0);
  data?.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.email} - Admin: ${user.is_admin}, Early Adopter: ${user.is_early_adopter}`);
  });
}

listUsers().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
