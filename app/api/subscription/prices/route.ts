import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data: prices, error } = await supabase
      .from('subscription_prices')
      .select(`
        id,
        stripe_price_id,
        amount,
        currency,
        interval,
        active,
        subscription_plans!inner (
          id,
          name,
          display_name,
          is_active
        )
      `)
      .eq('active', true)
      .eq('subscription_plans.is_active', true)
      .order('amount', { ascending: true });

    if (error) {
      console.error('Error fetching prices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prices' },
        { status: 500 }
      );
    }

    // Organizar preços por plano e intervalo
    const pricesByPlan: Record<string, any> = {};

    prices?.forEach((price: any) => {
      const planName = price.subscription_plans.name;

      if (!pricesByPlan[planName]) {
        pricesByPlan[planName] = {
          planId: price.subscription_plans.id,
          planName: price.subscription_plans.name,
          displayName: price.subscription_plans.display_name,
          prices: {},
        };
      }

      pricesByPlan[planName].prices[price.interval] = {
        id: price.id,
        stripePriceId: price.stripe_price_id,
        amount: price.amount,
        currency: price.currency,
        interval: price.interval,
      };
    });

    return NextResponse.json({ prices: pricesByPlan });
  } catch (error: any) {
    console.error('Error in prices API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
