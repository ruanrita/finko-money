import { NextRequest, NextResponse } from 'next/server';
import { PlansAdminService } from '@/src/modules/admin';
import { requireAdmin } from '@/lib/auth/admin-middleware';

// GET /api/admin/plans/stats - Estatísticas de uso de planos
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const stats = await PlansAdminService.getStats();
    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
