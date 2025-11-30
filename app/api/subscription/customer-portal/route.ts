import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/src/modules/subscription';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const session = await SubscriptionService.createCustomerPortal(
      user.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
