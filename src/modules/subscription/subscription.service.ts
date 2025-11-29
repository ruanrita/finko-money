import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export class SubscriptionService {
  /**
   * Criar ou obter customer do Stripe
   */
  static async getOrCreateStripeCustomer(userId: string, email: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (user?.stripe_customer_id) {
      return user.stripe_customer_id;
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  }

  /**
   * Criar sessão de checkout
   */
  static async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const customerId = await this.getOrCreateStripeCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
      subscription_data: {
        trial_period_days: 7, // 7 dias grátis
        metadata: { userId },
      },
    });

    return session;
  }

  /**
   * Criar portal do cliente
   */
  static async createCustomerPortal(userId: string, returnUrl: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user?.stripe_customer_id) {
      throw new Error('Customer não encontrado');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Cancelar assinatura
   */
  static async cancelSubscription(userId: string) {
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('Assinatura não encontrada');
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin
      .from('user_subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    return { message: 'Assinatura será cancelada no fim do período' };
  }

  /**
   * Verificar se assinaturas estão ativas
   */
  static async areSubscriptionsEnabled(): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('system_config')
      .select('value')
      .eq('key', 'subscriptions_enabled')
      .single();

    return data?.value === 'true';
  }

  /**
   * Ativar sistema de assinaturas (somente admin)
   */
  static async enableSubscriptions(adminUserId: string) {
    // Verificar se é admin
    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUserId)
      .single();

    if (!admin?.is_admin) {
      throw new Error('Acesso negado: somente administradores');
    }

    await supabaseAdmin
      .from('system_config')
      .update({
        value: 'true',
        updated_at: new Date().toISOString(),
        updated_by: adminUserId,
      })
      .eq('key', 'subscriptions_enabled');

    return { message: 'Sistema de assinaturas ativado com sucesso' };
  }

  /**
   * Desativar sistema de assinaturas (somente admin)
   */
  static async disableSubscriptions(adminUserId: string) {
    // Verificar se é admin
    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUserId)
      .single();

    if (!admin?.is_admin) {
      throw new Error('Acesso negado: somente administradores');
    }

    await supabaseAdmin
      .from('system_config')
      .update({
        value: 'false',
        updated_at: new Date().toISOString(),
        updated_by: adminUserId,
      })
      .eq('key', 'subscriptions_enabled');

    return { message: 'Sistema de assinaturas desativado com sucesso' };
  }
}
