import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CategoryService } from "./category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
} from "./category.schema";

/**
 * GET /api/categories - Lista todas as categorias do usuário
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

    const categories = await CategoryService.list(user.id);

    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories - Cria uma nova categoria
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
    const input = createCategorySchema.parse(body);

    const category = await CategoryService.create(user.id, input);

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/categories/[id] - Atualiza uma categoria
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
    getCategoryByIdSchema.parse({ id });

    const body = await request.json();
    const input = updateCategorySchema.parse(body);

    const category = await CategoryService.update(id, user.id, input);

    return NextResponse.json({ data: category }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/categories/[id] - Deleta uma categoria
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
    getCategoryByIdSchema.parse({ id });

    await CategoryService.delete(id, user.id);

    return NextResponse.json({ message: "Categoria deletada" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 400 }
    );
  }
}
