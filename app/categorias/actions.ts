"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryService } from "@/src/modules/categories";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/src/modules/categories/category.schema";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCategoriesAction() {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    return await CategoryService.list(user.id, branch.id);
  } catch (error: any) {
    console.error("getCategoriesAction error:", error.message);
    return [];
  }
}

export async function createCategoryAction(input: Omit<CreateCategoryInput, 'branch_id'>) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    // Validar branch.id
    if (!branch || !branch.id || branch.id.trim() === '') {
      throw new Error('Branch inválido. Faça logout e login novamente.');
    }

    // Remover branch_id do input se existir para evitar UUID inválido
    const { branch_id, ...cleanInput } = input as any;

    console.log('createCategoryAction - Debug:', {
      userId: user.id,
      branchId: branch.id,
      input: cleanInput,
    });

    const category = await CategoryService.create(user.id, branch.id, {
      name: cleanInput.name,
      color: cleanInput.color,
      icon: cleanInput.icon || null,
      branch_id: branch.id,
    } as CreateCategoryInput);

    revalidatePath("/categorias");
    revalidatePath("/financeiro");
    revalidatePath("/orcamentos");
    return { success: true, category };
  } catch (error: any) {
    console.error('createCategoryAction - Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCategoryAction(categoryId: string, input: UpdateCategoryInput) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    await CategoryService.update(categoryId, branch.id, user.id, input);
    revalidatePath("/categorias");
    revalidatePath("/financeiro");
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    await CategoryService.delete(categoryId, branch.id, user.id);
    revalidatePath("/categorias");
    revalidatePath("/financeiro");
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
