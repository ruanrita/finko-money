import { InstallmentBatchRepository } from "./installment-batch.repository";
import { TransactionRepository } from "../transactions/transaction.repository";
import type {
  CreateInstallmentBatchInput,
  UpdateInstallmentBatchInput,
  AmortizeInstallmentBatchInput,
  InstallmentBatch,
  InstallmentBatchWithTransactions,
} from "./installment-batch.schema";

export class InstallmentBatchService {
  /**
   * Create a new installment batch (called when creating installment transactions)
   */
  static async create(
    userId: string,
    branchId: string,
    input: CreateInstallmentBatchInput
  ): Promise<InstallmentBatch> {
    const installmentAmount = input.total_amount / input.installments_count;

    const firstDueDate = typeof input.first_due_date === "string"
      ? input.first_due_date
      : input.first_due_date.toISOString().split("T")[0];

    return await InstallmentBatchRepository.create(userId, {
      description: input.description,
      total_amount: input.total_amount,
      installments_count: input.installments_count,
      installment_amount: installmentAmount,
      type: input.type,
      category_id: input.category_id ?? null,
      payment_method: input.payment_method ?? null,
      first_due_date: firstDueDate,
      tags: input.tags || [],
      notes: input.notes ?? null,
      branch_id: branchId,
      status: "active",
      paid_installments: 0,
      original_total_amount: input.total_amount,
      amortized_amount: 0,
    });
  }

  /**
   * Get batch by ID
   */
  static async getById(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch> {
    const batch = await InstallmentBatchRepository.findById(id, branchId, userId);
    if (!batch) throw new Error("Lote de parcelas não encontrado");
    return batch;
  }

  /**
   * Get batch with all transactions
   */
  static async getByIdWithTransactions(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatchWithTransactions> {
    const batch = await InstallmentBatchRepository.findByIdWithTransactions(id, branchId, userId);
    if (!batch) throw new Error("Lote de parcelas não encontrado");
    return batch;
  }

  /**
   * List all batches
   */
  static async list(
    userId: string,
    branchId: string,
    filters?: {
      status?: "active" | "cancelled" | "completed";
      type?: "income" | "expense";
    }
  ): Promise<InstallmentBatch[]> {
    return await InstallmentBatchRepository.findByBranchId(branchId, userId, filters);
  }

  /**
   * Update batch metadata (description, category, tags, etc)
   */
  static async update(
    id: string,
    branchId: string,
    userId: string,
    input: UpdateInstallmentBatchInput
  ): Promise<InstallmentBatch> {
    const batch = await this.getById(id, branchId, userId);

    // If updating category or payment method, update all transactions too
    if (input.category_id !== undefined || input.payment_method !== undefined) {
      const batchWithTransactions = await this.getByIdWithTransactions(id, branchId, userId);

      for (const transaction of batchWithTransactions.transactions) {
        const updateData: any = {};
        if (input.category_id !== undefined) updateData.category_id = input.category_id;
        if (input.payment_method !== undefined) updateData.payment_method = input.payment_method;

        await TransactionRepository.update(transaction.id, branchId, userId, updateData);
      }
    }

    return await InstallmentBatchRepository.update(id, branchId, userId, input);
  }

  /**
   * Amortize (pay off early) part of the installment batch
   * This will recalculate remaining installments
   */
  static async amortize(
    id: string,
    branchId: string,
    userId: string,
    input: AmortizeInstallmentBatchInput
  ): Promise<InstallmentBatch> {
    const batchWithTransactions = await this.getByIdWithTransactions(id, branchId, userId);

    if (batchWithTransactions.status !== "active") {
      throw new Error("Não é possível amortizar um lote inativo ou cancelado");
    }

    // Get unpaid transactions
    const unpaidTransactions = batchWithTransactions.transactions.filter(t => !t.paid_at);

    if (unpaidTransactions.length === 0) {
      throw new Error("Não há parcelas pendentes para amortizar");
    }

    const remainingTotal = unpaidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    if (input.amortization_amount > remainingTotal) {
      throw new Error("Valor de amortização maior que o total restante");
    }

    // Calculate new values
    const newRemainingTotal = remainingTotal - input.amortization_amount;
    const newInstallmentAmount = newRemainingTotal / unpaidTransactions.length;

    // Update all unpaid transactions with new amount
    for (const transaction of unpaidTransactions) {
      await TransactionRepository.update(transaction.id, branchId, userId, {
        amount: newInstallmentAmount,
      });
    }

    // Update batch
    const newAmortizedAmount = batchWithTransactions.amortized_amount + input.amortization_amount;
    const amortizationDate = input.amortization_date
      ? typeof input.amortization_date === "string"
        ? input.amortization_date
        : input.amortization_date.toISOString()
      : new Date().toISOString();

    return await InstallmentBatchRepository.update(id, branchId, userId, {
      amortized_amount: newAmortizedAmount,
      last_amortization_date: amortizationDate,
      installment_amount: newInstallmentAmount,
    });
  }

  /**
   * Cancel batch and all unpaid transactions
   */
  static async cancel(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch> {
    const batchWithTransactions = await this.getByIdWithTransactions(id, branchId, userId);

    // Delete all unpaid transactions
    const unpaidTransactions = batchWithTransactions.transactions.filter(t => !t.paid_at);

    for (const transaction of unpaidTransactions) {
      await TransactionRepository.delete(transaction.id, branchId, userId);
    }

    // Mark batch as cancelled
    return await InstallmentBatchRepository.update(id, branchId, userId, {
      status: "cancelled",
    });
  }

  /**
   * Delete batch and ALL transactions (paid and unpaid)
   */
  static async delete(
    id: string,
    branchId: string,
    userId: string
  ): Promise<void> {
    await InstallmentBatchRepository.delete(id, branchId, userId);
  }

  /**
   * Mark batch as completed (when all installments are paid)
   */
  static async markAsCompleted(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch> {
    const batchWithTransactions = await this.getByIdWithTransactions(id, branchId, userId);

    const allPaid = batchWithTransactions.transactions.every(t => t.paid_at !== null);

    if (!allPaid) {
      throw new Error("Nem todas as parcelas foram pagas");
    }

    return await InstallmentBatchRepository.update(id, branchId, userId, {
      status: "completed",
      paid_installments: batchWithTransactions.installments_count,
    });
  }

  /**
   * Update paid count after marking transaction as paid/unpaid
   */
  static async updatePaidCount(
    id: string,
    branchId: string,
    userId: string
  ): Promise<InstallmentBatch> {
    const batch = await InstallmentBatchRepository.updatePaidCount(id, branchId, userId);

    // Auto-complete if all paid
    if (batch.paid_installments === batch.installments_count) {
      return await this.markAsCompleted(id, branchId, userId);
    }

    return batch;
  }
}
