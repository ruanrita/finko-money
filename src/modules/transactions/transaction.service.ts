import { TransactionRepository } from "./transaction.repository";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  MarkAsPaidInput,
} from "./transaction.schema";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export class TransactionService {
  /**
   * Lista transações com filtros
   */
  static async list(
    userId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    return await TransactionRepository.findByUserId(userId, filters);
  }

  /**
   * Busca uma transação por ID
   */
  static async getById(id: string, userId: string): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    return transaction;
  }

  /**
   * Cria uma nova transação (única ou parcelada)
   */
  static async create(
    userId: string,
    input: CreateTransactionInput
  ): Promise<Transaction | Transaction[]> {
    const dueDate = typeof input.due_date === "string"
      ? input.due_date
      : input.due_date.toISOString().split("T")[0];

    // Transação à vista
    if (input.installment_type === "a_vista") {
      return await TransactionRepository.create(userId, {
        type: input.type,
        amount: input.amount,
        description: input.description,
        category_id: input.category_id ?? null,
        due_date: dueDate,
        payment_method: input.payment_method,
        tags: input.tags || [],
        installment_type: "a_vista",
        is_recurring: input.is_recurring || false,
        recurrence_type: input.recurrence_type ?? null,
        paid_at: null,
      });
    }

    // Transação parcelada
    if (input.installment_type === "parcelado") {
      const installmentsCount = input.installments_count;
      const installmentAmount = input.amount / installmentsCount;

      // Cria a primeira transação (pai)
      const parentTransaction = await TransactionRepository.create(userId, {
        type: input.type,
        amount: installmentAmount,
        description: `${input.description} (1/${installmentsCount})`,
        category_id: input.category_id ?? null,
        due_date: dueDate,
        payment_method: input.payment_method,
        tags: input.tags || [],
        installment_type: "parcelado",
        installments_count: installmentsCount,
        current_installment: 1,
        is_recurring: false,
        paid_at: null,
      });

      // Cria as parcelas subsequentes
      const childTransactions: Omit<
        Database["public"]["Tables"]["transactions"]["Insert"],
        "user_id" | "id"
      >[] = [];

      for (let i = 2; i <= installmentsCount; i++) {
        const installmentDate = new Date(dueDate);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

        childTransactions.push({
          type: input.type,
          amount: installmentAmount,
          description: `${input.description} (${i}/${installmentsCount})`,
          category_id: input.category_id ?? null,
          due_date: installmentDate.toISOString().split("T")[0],
          payment_method: input.payment_method,
          tags: input.tags || [],
          installment_type: "parcelado",
          installments_count: installmentsCount,
          current_installment: i,
          parent_transaction_id: parentTransaction.id,
          is_recurring: false,
          paid_at: null,
        });
      }

      const createdChildren =
        await TransactionRepository.createMany(userId, childTransactions);

      return [parentTransaction, ...createdChildren];
    }

    throw new Error("Tipo de transação inválido");
  }

  /**
   * Atualiza uma transação
   */
  static async update(
    id: string,
    userId: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    // Converte due_date se necessário
    const updateData = { ...input };
    if (updateData.due_date) {
      updateData.due_date =
        typeof updateData.due_date === "string"
          ? updateData.due_date
          : updateData.due_date.toISOString().split("T")[0];
    }

    // Converte paid_at se necessário
    if (updateData.paid_at !== undefined) {
      updateData.paid_at =
        updateData.paid_at === null
          ? null
          : typeof updateData.paid_at === "string"
          ? updateData.paid_at
          : updateData.paid_at.toISOString();
    }

    return await TransactionRepository.update(id, userId, updateData);
  }

  /**
   * Marca uma transação como paga
   */
  static async markAsPaid(
    id: string,
    userId: string,
    input?: MarkAsPaidInput
  ): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    const paidAt =
      input?.paid_at === undefined
        ? new Date().toISOString()
        : typeof input.paid_at === "string"
        ? input.paid_at
        : input.paid_at.toISOString();

    return await TransactionRepository.update(id, userId, {
      paid_at: paidAt,
    });
  }

  /**
   * Marca uma transação como não paga
   */
  static async markAsUnpaid(id: string, userId: string): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    return await TransactionRepository.update(id, userId, {
      paid_at: null,
    });
  }

  /**
   * Deleta uma transação
   * Se for parcelada, pergunta se quer deletar todas as parcelas
   */
  static async delete(
    id: string,
    userId: string,
    deleteAllInstallments: boolean = false
  ): Promise<void> {
    const transaction = await TransactionRepository.findById(id, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    // Se for parcelada e quiser deletar todas
    if (
      transaction.installment_type === "parcelado" &&
      deleteAllInstallments
    ) {
      // Se for a primeira parcela (pai), busca todas as filhas
      if (!transaction.parent_transaction_id) {
        const children = await TransactionRepository.findByParentId(
          transaction.id,
          userId
        );
        const allIds = [transaction.id, ...children.map((c) => c.id)];
        await TransactionRepository.deleteMany(allIds, userId);
        return;
      }

      // Se for parcela filha, busca o pai e todas as irmãs
      if (transaction.parent_transaction_id) {
        const parent = await TransactionRepository.findById(
          transaction.parent_transaction_id,
          userId
        );
        if (parent) {
          const children = await TransactionRepository.findByParentId(
            parent.id,
            userId
          );
          const allIds = [parent.id, ...children.map((c) => c.id)];
          await TransactionRepository.deleteMany(allIds, userId);
          return;
        }
      }
    }

    // Deleta apenas a transação única
    await TransactionRepository.delete(id, userId);
  }

  /**
   * Calcula totais de receitas e despesas em um período
   */
  static async calculateTotals(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ income: number; expense: number; balance: number }> {
    const totals = await TransactionRepository.calculateTotals(
      userId,
      startDate,
      endDate
    );

    return {
      ...totals,
      balance: totals.income - totals.expense,
    };
  }
}
