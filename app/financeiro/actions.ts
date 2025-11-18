"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionService } from "@/src/modules/transactions";
import type { CreateTransactionInput } from "@/src/modules/transactions";

export async function createTransaction(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    const installmentType = (formData.get("installment_type") as "a_vista" | "parcelado") || "a_vista";
    const installmentsCount = formData.get("installments_count")
      ? parseInt(formData.get("installments_count") as string)
      : 1;

    const input: CreateTransactionInput = {
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

    await TransactionService.create(user.id, input);

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

    const input = {
      type: formData.get("type") as "income" | "expense",
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      due_date: formData.get("due_date") as string,
      category_id: (formData.get("category_id") as string) || null,
      payment_method: formData.get("payment_method") as string,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : [],
    };

    await TransactionService.update(id, user.id, input);

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

    await TransactionService.delete(id, user.id, deleteAllInstallments);

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

    await TransactionService.markAsPaid(id, user.id);

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

    await TransactionService.markAsUnpaid(id, user.id);

    revalidatePath("/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao marcar como não pago" };
  }
}
