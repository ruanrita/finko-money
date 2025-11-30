import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminLogin() {
  console.log('Testing admin login flow...');
  console.log('Supabase URL:', supabaseUrl);

  const testEmail = 'ruan.ritah@gmail.com';
  console.log('\n=== Step 1: Check if user exists ===');

  const { data: userCheck, error: userCheckError } = await supabaseAdmin
    .from('users')
    .select('id, email, is_admin, is_early_adopter, full_name')
    .eq('email', testEmail)
    .single();

  console.log('User check error:', userCheckError);
  console.log('User data:', userCheck);

  if (!userCheck) {
    console.log('❌ User does not exist in database!');
    return;
  }

  console.log('\n=== Step 2: Check auth.users ===');

  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  console.log('Auth users error:', authError);
  const authUser = authUsers?.users.find(u => u.email === testEmail);
  console.log('Auth user found:', authUser ? 'Yes' : 'No');
  if (authUser) {
    console.log('Auth user ID:', authUser.id);
    console.log('Matches DB user ID:', authUser.id === userCheck.id);
  }

  console.log('\n=== Step 3: Try login with Supabase Auth ===');

  // Note: We can't actually test the password here without the real password
  console.log('⚠️ Cannot test actual login without password');
  console.log('Assuming login succeeds...');

  console.log('\n=== Step 4: Check if admin ===');
  console.log('is_admin:', userCheck.is_admin);

  if (userCheck.is_admin) {
    console.log('\n=== Step 5: Check 2FA service ===');
    console.log('Would need to generate 2FA code for user:', userCheck.id);
    console.log('Email:', testEmail);
    console.log('Full name:', userCheck.full_name);

    // Check if verification_codes table exists and has permissions
    const { data: twoFactorTest, error: twoFactorError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('user_id', userCheck.id)
      .limit(1);

    console.log('Two factor codes error:', twoFactorError);
    console.log('Can access verification_codes table:', !twoFactorError);

    // Check if we can insert a test code
    const testCode = {
      user_id: userCheck.id,
      code: '123456',
      type: '2fa' as const,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    console.log('\n=== Step 6: Test inserting 2FA code ===');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert(testCode)
      .select()
      .single();

    console.log('Insert error:', insertError);
    console.log('Insert success:', !insertError);

    if (insertData) {
      // Clean up test code
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('id', insertData.id);
      console.log('✅ Test code created and deleted successfully');
    }
  }

  console.log('\n=== Step 7: Check RESEND_API_KEY ===');
  const resendKey = process.env.RESEND_API_KEY;
  console.log('RESEND_API_KEY present:', resendKey ? 'Yes' : 'No');
  console.log('RESEND_API_KEY value:', resendKey ? resendKey.substring(0, 10) + '...' : 'N/A');
}

testAdminLogin().then(() => {
  console.log('\n=== Test completed ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
