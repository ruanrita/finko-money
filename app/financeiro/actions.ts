"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { TransactionService } from "@/src/modules/transactions";
import { CategoryService } from "@/src/modules/categories";
import type { CreateTransactionInput, TransactionFilters } from "@/src/modules/transactions";

export async function createTransaction(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const installmentType = (formData.get("installment_type") as "a_vista" | "parcelado") || "a_vista";
    const installmentsCount = formData.get("installments_count")
      ? parseInt(formData.get("installments_count") as string)
      : 1;

    const input: any = {
      type: formData.get("type") as "income" | "expense",
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      due_date: formData.get("due_date") as string,
      category_id: (formData.get("category_id") as string) || null,
      payment_method: formData.get("payment_method") as string,
      installment_type: installmentType,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : [],
      ...(installmentType === "a_vista"
        ? {
            is_recurring: formData.get("is_recurring") === "true",
            recurrence_type: (formData.get("recurrence_type") as "monthly" | "weekly" | "yearly") || null,
          }
        : {
            installments_count: installmentsCount,
          }
      ),
    };

    await TransactionService.create(user.id, currentBranch.id, input);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao criar transação" };
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const installmentType = (formData.get("installment_type") as "a_vista" | "parcelado") || "a_vista";
    const installmentsCount = formData.get("installments_count")
      ? parseInt(formData.get("installments_count") as string)
      : 1;

    const input: any = {
      type: formData.get("type") as "income" | "expense",
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      due_date: formData.get("due_date") as string,
      category_id: (formData.get("category_id") as string) || null,
      payment_method: formData.get("payment_method") as string,
      installment_type: installmentType,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : [],
      ...(installmentType === "a_vista"
        ? {
            is_recurring: formData.get("is_recurring") === "true",
            recurrence_type: (formData.get("recurrence_type") as "monthly" | "weekly" | "yearly") || null,
            // Limpar campos de parcelamento quando mudar para à vista
            installments_count: null,
          }
        : {
            installments_count: installmentsCount,
            // Limpar campos de recorrência quando mudar para parcelado
            is_recurring: false,
            recurrence_type: null,
          }
      ),
    };

    await TransactionService.update(id, currentBranch.id, user.id, input);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar transação" };
  }
}

export async function deleteTransaction(id: string, deleteAllInstallments: boolean = false) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    await TransactionService.delete(id, currentBranch.id, user.id, deleteAllInstallments);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao deletar transação" };
  }
}

export async function markAsPaid(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    await TransactionService.markAsPaid(id, currentBranch.id, user.id);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao marcar como pago" };
  }
}

export async function markAsUnpaid(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    await TransactionService.markAsUnpaid(id, currentBranch.id, user.id);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao marcar como não pago" };
  }
}

export async function getTransactions(filters?: TransactionFilters) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado", data: null };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    // Se não tem filtro de mês, busca normal
    if (!filters?.month) {
      const transactions = await TransactionService.list(user.id, currentBranch.id, filters);
      return { data: transactions, error: null };
    }

    // Se tem filtro de mês, buscar transações normais e recorrentes separadamente
    const month = filters.month;

    // Buscar transações NORMAIS (não recorrentes) do mês
    const normalFilters = { ...filters, is_recurring: false };
    const normalTransactions = await TransactionService.list(user.id, currentBranch.id, normalFilters);

    // Buscar TODAS as transações recorrentes (sem filtro de mês)
    const recurringFilters = { ...filters };
    delete recurringFilters.month; // Remover filtro de mês
    recurringFilters.is_recurring = true;

    const allRecurringTransactions = await TransactionService.list(user.id, currentBranch.id, recurringFilters);

    // Filtrar transações recorrentes que devem aparecer neste mês
    const [year, monthNum] = month.split("-").map(Number);
    const filteredRecurringTransactions = allRecurringTransactions.filter((t: any) => {
      const originalDate = new Date(t.due_date);
      const targetDate = new Date(year, monthNum - 1, 1);

      // Só mostrar se o mês alvo for igual ou posterior à data original
      if (targetDate < new Date(originalDate.getFullYear(), originalDate.getMonth(), 1)) {
        return false;
      }

      switch (t.recurrence_type) {
        case "monthly":
          return true;
        case "yearly":
          return originalDate.getMonth() === monthNum - 1;
        case "weekly":
          return true;
        default:
          return false;
      }
    });

    // Combinar transações normais + recorrentes filtradas
    const allTransactions = [...normalTransactions, ...filteredRecurringTransactions];

    return { data: allTransactions, error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao buscar transações", data: null };
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado", data: null };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    const categories = await CategoryService.list(user.id, currentBranch.id);

    return { data: categories, error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao buscar categorias", data: null };
  }
}

export async function getCategoryTotals(month: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { expenses: [], income: [] };
    }

    // Pegar branch atual do usuário
    const currentBranch = await getCurrentBranch(user.id);

    // Calcular início e fim do mês
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    // Buscar transações NORMAIS (não recorrentes) do mês
    const { data: normalExpenses } = await supabase
      .from("transactions")
      .select("amount, category_id, categories(name, color)")
      .eq("branch_id", currentBranch.id)
      .eq("type", "expense")
      .eq("is_recurring", false)
      .gte("due_date", startDate.toISOString())
      .lte("due_date", endDate.toISOString());

    const { data: normalIncome } = await supabase
      .from("transactions")
      .select("amount, category_id, categories(name, color)")
      .eq("branch_id", currentBranch.id)
      .eq("type", "income")
      .eq("is_recurring", false)
      .gte("due_date", startDate.toISOString())
      .lte("due_date", endDate.toISOString());

    // Buscar TODAS as transações recorrentes (independente da data)
    const { data: recurringExpenses } = await supabase
      .from("transactions")
      .select("amount, category_id, due_date, is_recurring, recurrence_type, categories(name, color)")
      .eq("branch_id", currentBranch.id)
      .eq("type", "expense")
      .eq("is_recurring", true);

    const { data: recurringIncome } = await supabase
      .from("transactions")
      .select("amount, category_id, due_date, is_recurring, recurrence_type, categories(name, color)")
      .eq("branch_id", currentBranch.id)
      .eq("type", "income")
      .eq("is_recurring", true);

    // Filtrar transações recorrentes que devem aparecer neste mês
    const filterRecurringForMonth = (transactions: any[]) => {
      if (!transactions) return [];

      return transactions.filter((t) => {
        const originalDate = new Date(t.due_date);
        const targetDate = new Date(year, monthNum - 1, 1);

        // Só mostrar se o mês alvo for igual ou posterior à data original
        if (targetDate < new Date(originalDate.getFullYear(), originalDate.getMonth(), 1)) {
          return false;
        }

        switch (t.recurrence_type) {
          case "monthly":
            return true;
          case "yearly":
            return originalDate.getMonth() === monthNum - 1;
          case "weekly":
            // Simplificado: aceitar se estiver no mês certo ou depois
            return true;
          default:
            return false;
        }
      });
    };

    const filteredRecurringExpenses = filterRecurringForMonth(recurringExpenses || []);
    const filteredRecurringIncome = filterRecurringForMonth(recurringIncome || []);

    // Combinar transações normais + recorrentes filtradas
    const allExpenses = [...(normalExpenses || []), ...filteredRecurringExpenses];
    const allIncome = [...(normalIncome || []), ...filteredRecurringIncome];

    // Agregar por categoria
    const aggregateByCategory = (transactions: any[]) => {
      const categoryMap = new Map();

      transactions?.forEach((t) => {
        const categoryId = t.category_id || "no-category";
        const categoryName = (t.categories as any)?.name || "Sem categoria";
        const categoryColor = (t.categories as any)?.color || "#94a3b8";

        if (categoryMap.has(categoryId)) {
          const existing = categoryMap.get(categoryId);
          existing.total += Number(t.amount);
        } else {
          categoryMap.set(categoryId, {
            category_name: categoryName,
            category_color: categoryColor,
            total: Number(t.amount),
          });
        }
      });

      return Array.from(categoryMap.values());
    };

    return {
      expenses: aggregateByCategory(allExpenses),
      income: aggregateByCategory(allIncome),
    };
  } catch (error) {
    console.error("Error fetching category totals:", error);
    return { expenses: [], income: [] };
  }
}
