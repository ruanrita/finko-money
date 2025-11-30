import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testServiceRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  console.log('Testing service role access...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key (first 20 chars):', supabaseServiceKey?.substring(0, 20) + '...');
  console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

  // Test with service role
  console.log('\n=== Test 1: Service Role ===');
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: featuresService, error: errorService } = await supabaseService
    .from('features')
    .select('count');

  console.log('Service role error:', errorService);
  console.log('Service role data:', featuresService);

  // Test with anon key
  console.log('\n=== Test 2: Anon Key ===');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

  const { data: featuresAnon, error: errorAnon } = await supabaseAnon
    .from('features')
    .select('count');

  console.log('Anon key error:', errorAnon);
  console.log('Anon key data:', featuresAnon);
}

testServiceRole().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
