import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserFeatures() {
  const userEmail = 'ruan@gmail.com'; // Test with early adopter

  console.log('Testing features for user:', userEmail);
  console.log('Supabase URL:', supabaseUrl);

  // Get user info by email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, is_admin, is_early_adopter, subscription_plan_id')
    .eq('email', userEmail)
    .single();

  console.log('\n=== User Data ===');
  console.log('Error:', userError);
  console.log('Data:', userData);

  if (!userData) {
    console.log('User not found!');
    return;
  }

  const isAdmin = userData.is_admin || false;
  const isEarlyAdopter = userData.is_early_adopter || false;
  const planId = userData.subscription_plan_id;

  console.log('\n=== User Flags ===');
  console.log('isAdmin:', isAdmin);
  console.log('isEarlyAdopter:', isEarlyAdopter);
  console.log('planId:', planId);

  // Get all features
  const { data: allFeatures, error: featuresError } = await supabase
    .from('features')
    .select('*')
    .order('sort_order', { ascending: true });

  console.log('\n=== All Features ===');
  console.log('Error:', featuresError);
  console.log('Total features:', allFeatures?.length || 0);

  if (isAdmin || isEarlyAdopter) {
    console.log('\n=== Early Adopter / Admin ===');
    console.log('User should have access to ALL features!');

    if (allFeatures && allFeatures.length > 0) {
      allFeatures.forEach((feature, idx) => {
        console.log(`${idx + 1}. ${feature.display_name} (${feature.path}) - isCore: ${feature.is_core}`);
      });
    } else {
      console.log('⚠️ NO FEATURES FOUND - This is the problem!');
    }
  } else {
    // Get plan features
    const { data: planFeaturesData, error: planError } = await supabase
      .from('plan_features')
      .select(`
        features (
          id,
          name,
          display_name,
          description,
          path,
          icon,
          is_core,
          sort_order
        )
      `)
      .eq('plan_id', planId);

    console.log('\n=== Plan Features ===');
    console.log('Error:', planError);
    console.log('Plan features:', planFeaturesData?.length || 0);
    console.log('Data:', planFeaturesData);
  }

  // Now test the actual getUserFeaturesWithAccess logic
  console.log('\n=== Simulating getUserFeaturesWithAccess ===');

  if (isAdmin || isEarlyAdopter) {
    const result = allFeatures?.map(feature => ({
      feature,
      hasAccess: true,
      isCore: feature.is_core
    })) || [];

    console.log('Result length:', result.length);
    if (result.length === 0) {
      console.log('⚠️ PROBLEM: getUserFeaturesWithAccess would return empty array!');
    } else {
      console.log('✅ Would return', result.length, 'features with access');
    }
  }
}

testUserFeatures().then(() => {
  console.log('\n=== Test completed ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
