import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('✅ Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('❌ No userId in checkout session metadata');
    return;
  }

  console.log('🔄 Processing checkout completion for user:', userId);

  if (!session.subscription) {
    console.error('❌ No subscription ID in checkout session');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await updateUserSubscription(userId, subscription);
  } catch (error: any) {
    console.error('❌ Error processing checkout completion:', error.message);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('❌ No userId in subscription metadata');
    return;
  }

  console.log('🔄 Updating subscription for user:', userId, 'Status:', subscription.status);

  try {
    await updateUserSubscription(userId, subscription);
  } catch (error: any) {
    console.error('❌ Error updating subscription:', error.message);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Retornar para plano Free
  const { data: freePlan } = await supabaseAdmin
    .from('subscription_plans')
    .select('id')
    .eq('name', 'free')
    .single();

  await supabaseAdmin
    .from('users')
    .update({
      subscription_plan_id: freePlan?.id,
      subscription_status: 'canceled',
      subscription_current_period_end: null,
    })
    .eq('id', userId);

  await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Payment succeeded:', invoice.id);
  // TODO: Enviar email de confirmação
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Buscar usuário pelo customer ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (user) {
    // Marcar assinatura como past_due
    await supabaseAdmin
      .from('users')
      .update({ subscription_status: 'past_due' })
      .eq('id', user.id);

    // TODO: Notificar usuário via email
    console.log(`⚠️ User ${user.email} payment failed`);
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  console.log('📝 Updating subscription:', {
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
  });

  const priceId = subscription.items.data[0]?.price?.id;

  if (!priceId) {
    console.error('❌ No price ID in subscription');
    return;
  }

  // Buscar price no banco
  const { data: price, error: priceError } = await supabaseAdmin
    .from('subscription_prices')
    .select('id, plan_id')
    .eq('stripe_price_id', priceId)
    .single();

  if (priceError || !price) {
    console.error('❌ Price not found in database:', priceId, priceError);
    return;
  }

  console.log('✅ Found price in database:', { priceId, planId: price.plan_id });

  // Helper para converter timestamp do Stripe (Unix) para ISO string
  const toISOString = (timestamp: number | null | undefined): string | null => {
    if (!timestamp || isNaN(timestamp)) {
      console.warn('⚠️ Invalid timestamp received:', timestamp);
      return null;
    }
    try {
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date from timestamp:', timestamp);
        return null;
      }
      return date.toISOString();
    } catch (error) {
      console.error('❌ Error converting timestamp:', timestamp, error);
      return null;
    }
  };

  // Converter timestamps
  const periodStart = toISOString(subscription.current_period_start);
  const periodEnd = toISOString(subscription.current_period_end);

  console.log('📅 Converted timestamps:', { periodStart, periodEnd });

  // Atualizar users table
  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({
      subscription_plan_id: price.plan_id,
      subscription_status: subscription.status,
      subscription_current_period_end: periodEnd,
    })
    .eq('id', userId);

  if (userError) {
    console.error('❌ Error updating users table:', userError);
    throw userError;
  }

  console.log('✅ Updated users table');

  // Atualizar/criar user_subscriptions
  const { error: subError } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        plan_id: price.plan_id,
        price_id: price.id,
        status: subscription.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    );

  if (subError) {
    console.error('❌ Error updating user_subscriptions table:', subError);
    throw subError;
  }

  console.log('✅ Updated user_subscriptions table');
  console.log('✅ User subscription fully updated:', userId);
}
