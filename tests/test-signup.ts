/**
 * Script de teste para signup de usuários
 *
 * Como executar:
 * 1. Certifique-se que o Docker está rodando
 * 2. Execute: npx tsx tests/test-signup.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log('🧪 Testando signup de usuário...\n');

  const testEmail = 'ruan.ritah@gmail.com';
  const testPassword = '123456';
  const testName = 'Ruan Ritah';

  console.log('📝 Dados do teste:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Nome: ${testName}`);
  console.log('');

  try {
    // 1. Verificar se usuário já existe
    console.log('1️⃣ Verificando se usuário já existe...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, full_name, is_early_adopter, subscription_status')
      .eq('email', testEmail)
      .single();

    if (existingUser) {
      console.log('⚠️  Usuário já existe no banco:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nome: ${existingUser.full_name}`);
      console.log(`   Early Adopter: ${existingUser.is_early_adopter}`);
      console.log(`   Status: ${existingUser.subscription_status}`);
      console.log('');
      console.log('💡 Deletando usuário existente para refazer o teste...');

      // Deletar do auth.users (cascade deleta de public.users também)
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('✅ Usuário deletado com sucesso\n');
    } else {
      console.log('✅ Usuário não existe (OK)\n');
    }

    // 2. Criar novo usuário
    console.log('2️⃣ Criando novo usuário via signUp...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });

    if (signUpError) {
      console.error('❌ Erro no signUp:', signUpError.message);
      console.error('   Código:', signUpError.status);
      console.error('   Detalhes:', signUpError);
      return;
    }

    if (!signUpData.user) {
      console.error('❌ Nenhum usuário foi criado');
      return;
    }

    console.log('✅ Usuário criado no auth.users:');
    console.log(`   ID: ${signUpData.user.id}`);
    console.log(`   Email: ${signUpData.user.email}`);
    console.log('');

    // 3. Aguardar e verificar se foi criado em public.users
    console.log('3️⃣ Aguardando criação do perfil...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        is_admin,
        is_early_adopter,
        subscription_status,
        subscription_plan_id,
        subscription_plans (
          name,
          display_name,
          max_transactions,
          max_categories
        )
      `)
      .eq('id', signUpData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      console.error('   Código:', profileError.code);
      console.error('   Detalhes:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ Perfil não foi criado em public.users');
      console.error('   Isso indica que o trigger handle_new_user não executou');
      return;
    }

    console.log('✅ Perfil criado em public.users:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Nome: ${profile.full_name}`);
    console.log(`   Admin: ${profile.is_admin}`);
    console.log(`   Early Adopter: ${profile.is_early_adopter}`);
    console.log(`   Status: ${profile.subscription_status}`);
    console.log(`   Plano ID: ${profile.subscription_plan_id}`);
    console.log('');

    if (profile.subscription_plans) {
      const plan = Array.isArray(profile.subscription_plans) ? profile.subscription_plans[0] : profile.subscription_plans;
      console.log('✅ Plano atribuído:');
      console.log(`   Nome: ${plan.display_name}`);
      console.log(`   Transações/mês: ${plan.max_transactions}`);
      console.log(`   Categorias: ${plan.max_categories}`);
    } else {
      console.error('❌ Nenhum plano foi atribuído!');
      console.error('   Isso indica que o trigger assign_initial_plan não executou');
    }

    console.log('');
    console.log('========================================');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('========================================');

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Executar teste
testSignup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
