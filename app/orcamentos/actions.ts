"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetService } from "@/src/modules/budgets";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/src/modules/budgets";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { CategoryService } from "@/src/modules/categories";

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

export async function getBudgetsAction(month: string) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    return await BudgetService.getMonthBudgets(user.id, branch.id, month);
  } catch (error: any) {
    console.error("getBudgetsAction error:", error.message);
    return [];
  }
}

export async function getMonthSummaryAction(month: string) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    return await BudgetService.getMonthSummary(user.id, branch.id, month);
  } catch (error: any) {
    console.error("getMonthSummaryAction error:", error.message);
    return null;
  }
}

export async function createBudgetAction(input: CreateBudgetInput) {
  const user = await getAuthenticatedUser();

  try {
    await BudgetService.createBudget(input, user.id);
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBudgetAction(budgetId: string, input: UpdateBudgetInput) {
  const user = await getAuthenticatedUser();

  try {
    await BudgetService.updateBudget(budgetId, input, user.id);
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBudgetAction(budgetId: string) {
  const user = await getAuthenticatedUser();

  try {
    await BudgetService.deleteBudget(budgetId, user.id);
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function copyFromPreviousMonthAction(targetMonth: string) {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    await BudgetService.copyFromPreviousMonth(user.id, branch.id, targetMonth);
    revalidatePath("/orcamentos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCategoriesAction() {
  const user = await getAuthenticatedUser();
  const branch = await getCurrentBranch(user.id);

  try {
    const categories = await CategoryService.list(user.id, branch.id);
    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
