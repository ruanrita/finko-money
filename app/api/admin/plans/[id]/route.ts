import { NextRequest, NextResponse } from 'next/server';
import { PlansAdminService } from '@/src/modules/admin';
import { requireAdmin } from '@/lib/auth/admin-middleware';

// GET /api/admin/plans/[id] - Buscar plano específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const plan = await PlansAdminService.getById(id);
    return NextResponse.json({ data: plan });
  } catch (error: any) {
    console.error('Error getting plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/plans/[id] - Atualizar plano
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const planData = await request.json();
    const plan = await PlansAdminService.update(id, planData);
    return NextResponse.json({ data: plan });
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/plans/[id] - Deletar (desativar) plano
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const result = await PlansAdminService.delete(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
