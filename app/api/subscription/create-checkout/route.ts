import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/src/modules/subscription';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { priceId } = await request.json();

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID não fornecido' }, { status: 400 });
  }

  try {
    // Verificar se assinaturas estão ativas
    const subscriptionsEnabled = await SubscriptionService.areSubscriptionsEnabled();

    if (!subscriptionsEnabled) {
      return NextResponse.json(
        { error: 'Sistema de assinaturas não está ativo no momento' },
        { status: 403 }
      );
    }

    const session = await SubscriptionService.createCheckoutSession(
      user.id,
      user.email!,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
