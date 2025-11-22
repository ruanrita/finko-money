import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { GoalService } from "./goal.service";
import {
  createGoalSchema,
  updateGoalSchema,
  createContributionSchema,
  listGoalsSchema,
} from "./goal.schema";

/**
 * GET /api/goals - Lista metas com filtros
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    // Parse query params para filtros
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      is_active: searchParams.get("is_active") === "true" ? true : searchParams.get("is_active") === "false" ? false : undefined,
      goal_type: searchParams.get("goal_type") || undefined,
      priority: searchParams.get("priority") || undefined,
    };

    const validatedFilters = listGoalsSchema.parse(filters);
    const goals = await GoalService.listGoals(user.id, currentBranch.id, validatedFilters);

    return NextResponse.json({ data: goals }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar metas:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals - Cria uma nova meta
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const body = await request.json();
    const input = createGoalSchema.parse(body);

    const result = await GoalService.createGoal(user.id, currentBranch.id, input);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/goals/[id] - Busca meta por ID
 */
export async function GET_BY_ID(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const goal = await GoalService.getGoal(id, user.id);

    return NextResponse.json({ data: goal }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/goals/[id] - Atualiza uma meta
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = updateGoalSchema.parse(body);

    const result = await GoalService.updateGoal(id, user.id, input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/goals/[id] - Deleta uma meta
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const result = await GoalService.deleteGoal(id, user.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/goals/[id]/contributions - Lista contribuições de uma meta
 */
export async function GET_CONTRIBUTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const contributions = await GoalService.listContributions(id, user.id);

    return NextResponse.json({ data: contributions }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar contribuições:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/contributions - Cria contribuição para uma meta
 */
export async function POST_CONTRIBUTION(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = createContributionSchema.parse(body);

    const result = await GoalService.createContribution(id, user.id, input);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar contribuição:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/goals/stats - Obter estatísticas das metas
 */
export async function GET_STATS(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const stats = await GoalService.getStats(user.id, currentBranch.id);

    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals/emergency-fund-suggestion - Calcula sugestão de reserva de emergência
 */
export async function GET_EMERGENCY_SUGGESTION(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const suggestion = await GoalService.calculateEmergencyFundSuggestion(
      user.id,
      currentBranch.id
    );

    return NextResponse.json({ data: suggestion }, { status: 200 });
  } catch (error) {
    console.error("Erro ao calcular sugestão:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
