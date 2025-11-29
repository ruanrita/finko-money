import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBranch } from '@/lib/supabase/branch-context';
import { UsageService, type ResourceType } from './usage.service';

/**
 * GET /api/usage/check?type=transaction - Verifica limite de uso de um recurso
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ResourceType | null;
    const branchIdParam = searchParams.get('branchId');

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo de recurso não especificado' },
        { status: 400 }
      );
    }

    // Validar tipo de recurso
    const validTypes: ResourceType[] = [
      'transaction',
      'category',
      'goal',
      'budget',
      'team_member',
      'branch',
      'reminder',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de recurso inválido' },
        { status: 400 }
      );
    }

    // Se não foi passado branchId e o recurso precisa de branch, pegar o branch atual
    let branchId = branchIdParam;
    if (!branchId && ['transaction', 'category', 'goal', 'budget', 'team_member'].includes(type)) {
      try {
        const currentBranch = await getCurrentBranch(user.id);
        branchId = currentBranch.id;
      } catch (error) {
        // Se não conseguir pegar o branch, continua sem (vai usar apenas userId)
        branchId = undefined;
      }
    }

    const result = await UsageService.checkUsageLimit(user.id, type, branchId);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar limite de uso:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/usage/plan - Retorna informações do plano do usuário
 */
export async function getPlan(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const result = await UsageService.getUserPlan(user.id);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/usage/feature?name=export_pdf - Verifica acesso a uma feature
 */
export async function getFeature(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const feature = searchParams.get('name') as
      | 'advanced_reports'
      | 'export_csv'
      | 'export_pdf'
      | 'export_excel'
      | null;

    if (!feature) {
      return NextResponse.json(
        { error: 'Nome da feature não especificado' },
        { status: 400 }
      );
    }

    const validFeatures = ['advanced_reports', 'export_csv', 'export_pdf', 'export_excel'];
    if (!validFeatures.includes(feature)) {
      return NextResponse.json({ error: 'Feature inválida' }, { status: 400 });
    }

    const result = await UsageService.hasFeatureAccess(user.id, feature);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar acesso a feature:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
