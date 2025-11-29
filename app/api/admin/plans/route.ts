import { NextRequest, NextResponse } from 'next/server';
import { PlansAdminService } from '@/src/modules/admin';
import { requireAdmin } from '@/lib/auth/admin-middleware';

// GET /api/admin/plans - Listar todos os planos
export async function GET(request: NextRequest) {
  const { error, user } = await requireAdmin(request);
  if (error) return error;

  try {
    const plans = await PlansAdminService.listAll();
    return NextResponse.json({ data: plans });
  } catch (error: any) {
    console.error('Error listing plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/plans - Criar novo plano
export async function POST(request: NextRequest) {
  const { error, user } = await requireAdmin(request);
  if (error) return error;

  try {
    const planData = await request.json();
    const plan = await PlansAdminService.create(planData);
    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
