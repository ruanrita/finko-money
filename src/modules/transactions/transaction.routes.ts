import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TransactionService } from "./transaction.service";
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionByIdSchema,
  transactionFiltersSchema,
  markAsPaidSchema,
} from "./transaction.schema";

/**
 * GET /api/transactions - Lista transações com filtros
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

    // Parse query params para filtros
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      type: searchParams.get("type") || undefined,
      category_id: searchParams.get("category_id") || undefined,
      status: searchParams.get("status") || undefined,
      payment_method: searchParams.get("payment_method") || undefined,
      installment_type: searchParams.get("installment_type") || undefined,
      month: searchParams.get("month") || undefined,
      search: searchParams.get("search") || undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
    };

    const validatedFilters = transactionFiltersSchema.parse(filters);
    const transactions = await TransactionService.list(user.id, validatedFilters);

    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions - Cria uma nova transação
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

    const body = await request.json();
    const input = createTransactionSchema.parse(body);

    const transaction = await TransactionService.create(user.id, input);

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/transactions/[id] - Atualiza uma transação
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
    getTransactionByIdSchema.parse({ id });

    const body = await request.json();
    const input = updateTransactionSchema.parse(body);

    const transaction = await TransactionService.update(id, user.id, input);

    return NextResponse.json({ data: transaction }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/transactions/[id] - Deleta uma transação
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
    getTransactionByIdSchema.parse({ id });

    // Query param para deletar todas as parcelas
    const deleteAll =
      request.nextUrl.searchParams.get("delete_all") === "true";

    await TransactionService.delete(id, user.id, deleteAll);

    return NextResponse.json(
      { message: "Transação deletada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * POST /api/transactions/[id]/mark-paid - Marca transação como paga
 */
export async function markAsPaidHandler(
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
    getTransactionByIdSchema.parse({ id });

    const body = await request.json();
    const input = markAsPaidSchema.parse(body);

    const transaction = await TransactionService.markAsPaid(id, user.id, input);

    return NextResponse.json({ data: transaction }, { status: 200 });
  } catch (error) {
    console.error("Erro ao marcar transação como paga:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * POST /api/transactions/[id]/mark-unpaid - Marca transação como não paga
 */
export async function markAsUnpaidHandler(
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
    getTransactionByIdSchema.parse({ id });

    const transaction = await TransactionService.markAsUnpaid(id, user.id);

    return NextResponse.json({ data: transaction }, { status: 200 });
  } catch (error) {
    console.error("Erro ao marcar transação como não paga:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}
