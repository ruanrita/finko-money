import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ plan: null, authenticated: false });
    }

    // Buscar plano do usuário
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        subscription_status,
        is_early_adopter,
        subscription_plans (
          name,
          display_name
        )
      `)
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ plan: null, authenticated: true });
    }

    const plan = userData.subscription_plans as any;

    return NextResponse.json({
      authenticated: true,
      plan: {
        name: plan?.name || 'free',
        displayName: plan?.display_name || 'Plano Free',
        status: userData.subscription_status,
        isEarlyAdopter: userData.is_early_adopter,
      },
    });
  } catch (error: any) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current plan' },
      { status: 500 }
    );
  }
}
