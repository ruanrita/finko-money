/**
 * Script para criar produtos e preços no Stripe
 *
 * Uso:
 *   npx tsx scripts/create-stripe-products.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🚀 Criando produtos no Stripe...\n');

  try {
    // 1. Criar produto "Plano Pro"
    console.log('📦 Criando produto "Plano Pro"...');
    const product = await stripe.products.create({
      name: 'Plano Pro - FinkoMoney',
      description: 'Plano profissional com recursos avançados para gestão financeira',
      metadata: {
        plan_name: 'pro',
      },
    });
    console.log(`✅ Produto criado: ${product.id}\n`);

    // 2. Criar preço mensal
    console.log('💰 Criando preço mensal (R$ 15,90/mês)...');
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 1590, // R$ 15,90 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        plan_name: 'pro',
        interval: 'month',
      },
    });
    console.log(`✅ Preço mensal criado: ${monthlyPrice.id}\n`);

    // 3. Criar preço anual
    console.log('💰 Criando preço anual (R$ 159,00/ano)...');
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 15900, // R$ 159,00 em centavos
      currency: 'brl',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      metadata: {
        plan_name: 'pro',
        interval: 'year',
      },
    });
    console.log(`✅ Preço anual criado: ${yearlyPrice.id}\n`);

    // 4. Atualizar banco de dados
    console.log('💾 Atualizando banco de dados...\n');

    // Atualizar product ID
    console.log('  → Atualizando stripe_product_id...');
    const { error: updateError } = await supabase
      .from('subscription_plans')
      .update({ stripe_product_id: product.id })
      .eq('name', 'pro');

    if (updateError) {
      throw new Error(`Erro ao atualizar product_id: ${updateError.message}`);
    }
    console.log('  ✅ stripe_product_id atualizado\n');

    // Buscar plan_id
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'pro')
      .single();

    if (!plan) {
      throw new Error('Plano "pro" não encontrado no banco');
    }

    // Atualizar preço mensal
    console.log('  → Atualizando preço mensal...');
    const { error: monthlyError } = await supabase
      .from('subscription_prices')
      .update({ stripe_price_id: monthlyPrice.id })
      .eq('plan_id', plan.id)
      .eq('interval', 'month');

    if (monthlyError) {
      throw new Error(`Erro ao atualizar preço mensal: ${monthlyError.message}`);
    }
    console.log('  ✅ Preço mensal atualizado\n');

    // Atualizar preço anual
    console.log('  → Atualizando preço anual...');
    const { error: yearlyError } = await supabase
      .from('subscription_prices')
      .update({ stripe_price_id: yearlyPrice.id })
      .eq('plan_id', plan.id)
      .eq('interval', 'year');

    if (yearlyError) {
      throw new Error(`Erro ao atualizar preço anual: ${yearlyError.message}`);
    }
    console.log('  ✅ Preço anual atualizado\n');

    // 5. Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📋 Resumo:');
    console.log(`   Product ID:      ${product.id}`);
    console.log(`   Preço Mensal:    ${monthlyPrice.id} (R$ 15,90/mês)`);
    console.log(`   Preço Anual:     ${yearlyPrice.id} (R$ 159,00/ano)`);
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verificar produtos no Stripe Dashboard:');
    console.log('      https://dashboard.stripe.com/test/products\n');
    console.log('   2. Testar o checkout na página /pricing\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\n📝 Detalhes:', error);

    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  STRIPE_SECRET_KEY inválida ou não configurada.');
      console.error('   Verifique o arquivo .env.local\n');
    }

    process.exit(1);
  }
}

main();
