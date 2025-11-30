/**
 * Script de teste para validar o sistema de limitações
 * Execute: npx tsx scripts/test-usage-limits.ts
 */

import { UsageService } from '../src/modules/usage/usage.service';

async function testUsageLimits() {
  console.log('🧪 Testando Sistema de Limitações\n');

  // User ID do seed (Ruan)
  const userId = '689ca39f-93c9-4dfb-bb11-e54f567eed39';

  try {
    console.log('1. Testando checkUsageLimit para transações...');
    const transactionCheck = await UsageService.checkUsageLimit(userId, 'transaction');
    console.log('✅ Resultado:', JSON.stringify(transactionCheck, null, 2));

    console.log('\n2. Testando checkUsageLimit para categorias...');
    const categoryCheck = await UsageService.checkUsageLimit(userId, 'category');
    console.log('✅ Resultado:', JSON.stringify(categoryCheck, null, 2));

    console.log('\n3. Testando checkUsageLimit para metas...');
    const goalCheck = await UsageService.checkUsageLimit(userId, 'goal');
    console.log('✅ Resultado:', JSON.stringify(goalCheck, null, 2));

    console.log('\n4. Testando checkUsageLimit para orçamentos...');
    const budgetCheck = await UsageService.checkUsageLimit(userId, 'budget');
    console.log('✅ Resultado:', JSON.stringify(budgetCheck, null, 2));

    console.log('\n5. Testando checkUsageLimit para branches...');
    const branchCheck = await UsageService.checkUsageLimit(userId, 'branch');
    console.log('✅ Resultado:', JSON.stringify(branchCheck, null, 2));

    console.log('\n6. Testando getUserPlan...');
    const userPlan = await UsageService.getUserPlan(userId);
    console.log('✅ Resultado:', JSON.stringify(userPlan, null, 2));

    console.log('\n7. Testando hasFeatureAccess - export_csv...');
    const csvAccess = await UsageService.hasFeatureAccess(userId, 'export_csv');
    console.log('✅ Resultado:', JSON.stringify(csvAccess, null, 2));

    console.log('\n8. Testando hasFeatureAccess - export_pdf...');
    const pdfAccess = await UsageService.hasFeatureAccess(userId, 'export_pdf');
    console.log('✅ Resultado:', JSON.stringify(pdfAccess, null, 2));

    console.log('\n✅ Todos os testes passaram!\n');
    console.log('📊 Resumo do Plano:');
    console.log(`   Nome: ${userPlan.plan?.display_name || 'N/A'}`);
    console.log(`   Early Adopter: ${userPlan.isEarlyAdopter ? 'Sim' : 'Não'}`);
    console.log(`   Status: ${userPlan.status}`);
    console.log('\n📈 Uso Atual:');
    console.log(`   Transações: ${transactionCheck.current}/${transactionCheck.limit} (${transactionCheck.percentage}%)`);
    console.log(`   Categorias: ${categoryCheck.current}/${categoryCheck.limit} (${categoryCheck.percentage}%)`);
    console.log(`   Metas: ${goalCheck.current}/${goalCheck.limit} (${goalCheck.percentage}%)`);
    console.log(`   Orçamentos: ${budgetCheck.current}/${budgetCheck.limit} (${budgetCheck.percentage}%)`);
    console.log(`   Branches: ${branchCheck.current}/${branchCheck.limit || 'Ilimitado'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao testar:', error);
    process.exit(1);
  }
}

testUsageLimits();
