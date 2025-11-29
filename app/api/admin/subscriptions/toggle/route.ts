import { NextRequest, NextResponse } from 'next/server';
import { PlansAdminService } from '@/src/modules/admin';
import { requireAdmin } from '@/lib/auth/admin-middleware';

// POST /api/admin/subscriptions/toggle - Ativar/Desativar sistema de assinaturas
export async function POST(request: NextRequest) {
  const { error, user } = await requireAdmin(request);
  if (error) return error;

  try {
    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetro "enabled" deve ser booleano' }, { status: 400 });
    }

    const result = await PlansAdminService.toggleSubscriptions(enabled, user!.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error toggling subscriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/admin/subscriptions/toggle - Ver status atual
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const config = await PlansAdminService.getSubscriptionConfig();
    return NextResponse.json({
      enabled: config.value === 'true',
      updated_at: config.updated_at,
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
