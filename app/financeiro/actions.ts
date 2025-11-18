"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Insert"];

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const installmentType = (formData.get("installment_type") as "a_vista" | "parcelado") || "a_vista";
  const installmentsCount = formData.get("installments_count") ? parseInt(formData.get("installments_count") as string) : null;

  const baseTransaction: Transaction = {
    user_id: user.id,
    type: formData.get("type") as "income" | "expense",
    amount: parseFloat(formData.get("amount") as string),
    description: formData.get("description") as string,
    due_date: formData.get("due_date") as string,
    category_id: (formData.get("category_id") as string) || null,
    payment_method: (formData.get("payment_method") as string) || null,
    installment_type: installmentType,
    installments_count: installmentsCount,
    is_recurring: formData.get("is_recurring") === "true",
    recurrence_type: (formData.get("recurrence_type") as "monthly" | "weekly" | "yearly") || null,
    tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : null,
  };

  // Se for parcelado, criar múltiplas transações
  if (installmentType === "parcelado" && installmentsCount && installmentsCount > 1) {
    const transactions: Transaction[] = [];
    const baseDate = new Date(baseTransaction.due_date);

    // Dividir o valor total pelas parcelas
    const installmentAmount = baseTransaction.amount / installmentsCount;

    for (let i = 0; i < installmentsCount; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      transactions.push({
        ...baseTransaction,
        amount: installmentAmount, // Valor dividido por parcela
        description: `${baseTransaction.description} (${i + 1}/${installmentsCount})`,
        due_date: installmentDate.toISOString().split("T")[0],
        current_installment: i + 1,
      });
    }

    const { error } = await supabase.from("transactions").insert(transactions);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Transação única (à vista ou recorrente)
    const { error } = await supabase.from("transactions").insert([baseTransaction]);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const installmentType = (formData.get("installment_type") as "a_vista" | "parcelado") || "a_vista";
  const installmentsCount = formData.get("installments_count") ? parseInt(formData.get("installments_count") as string) : null;

  const transaction: Partial<Transaction> = {
    type: formData.get("type") as "income" | "expense",
    amount: parseFloat(formData.get("amount") as string),
    description: formData.get("description") as string,
    due_date: formData.get("due_date") as string,
    category_id: (formData.get("category_id") as string) || null,
    payment_method: (formData.get("payment_method") as string) || null,
    installment_type: installmentType,
    installments_count: installmentsCount,
    is_recurring: formData.get("is_recurring") === "true",
    recurrence_type: (formData.get("recurrence_type") as "monthly" | "weekly" | "yearly") || null,
    tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : null,
  };

  const { error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAsPaid(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({ paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAsUnpaid(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({ paid_at: null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}
