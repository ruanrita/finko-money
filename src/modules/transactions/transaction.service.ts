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
   * Lista transações de um branch com filtros
   */
  static async list(
    userId: string,
    branchId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    return await TransactionRepository.findByBranchId(branchId, userId, filters);
  }

  /**
   * Busca uma transação por ID
   */
  static async getById(id: string, branchId: string, userId: string): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, branchId, userId);

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
    branchId: string,
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
        branch_id: branchId,
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
        branch_id: branchId,
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
          branch_id: branchId,
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
    branchId: string,
    userId: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, branchId, userId);

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

    return await TransactionRepository.update(id, branchId, userId, updateData);
  }

  /**
   * Marca uma transação como paga
   */
  static async markAsPaid(
    id: string,
    branchId: string,
    userId: string,
    input?: MarkAsPaidInput
  ): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, branchId, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    const paidAt =
      input?.paid_at === undefined
        ? new Date().toISOString()
        : typeof input.paid_at === "string"
        ? input.paid_at
        : input.paid_at.toISOString();

    return await TransactionRepository.update(id, branchId, userId, {
      paid_at: paidAt,
    });
  }

  /**
   * Marca uma transação como não paga
   */
  static async markAsUnpaid(id: string, branchId: string, userId: string): Promise<Transaction> {
    const transaction = await TransactionRepository.findById(id, branchId, userId);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    return await TransactionRepository.update(id, branchId, userId, {
      paid_at: null,
    });
  }

  /**
   * Deleta uma transação
   * Se for parcelada, pergunta se quer deletar todas as parcelas
   */
  static async delete(
    id: string,
    branchId: string,
    userId: string,
    deleteAllInstallments: boolean = false
  ): Promise<void> {
    const transaction = await TransactionRepository.findById(id, branchId, userId);

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
          branchId,
          userId
        );
        const allIds = [transaction.id, ...children.map((c) => c.id)];
        await TransactionRepository.deleteMany(allIds, branchId, userId);
        return;
      }

      // Se for parcela filha, busca o pai e todas as irmãs
      if (transaction.parent_transaction_id) {
        const parent = await TransactionRepository.findById(
          transaction.parent_transaction_id,
          branchId,
          userId
        );
        if (parent) {
          const children = await TransactionRepository.findByParentId(
            parent.id,
            branchId,
            userId
          );
          const allIds = [parent.id, ...children.map((c) => c.id)];
          await TransactionRepository.deleteMany(allIds, branchId, userId);
          return;
        }
      }
    }

    // Deleta apenas a transação única
    await TransactionRepository.delete(id, branchId, userId);
  }

  /**
   * Calcula totais de receitas e despesas em um período
   */
  static async calculateTotals(
    userId: string,
    branchId: string,
    startDate: string,
    endDate: string
  ): Promise<{ income: number; expense: number; balance: number }> {
    const totals = await TransactionRepository.calculateTotals(
      branchId,
      userId,
      startDate,
      endDate
    );

    return {
      ...totals,
      balance: totals.income - totals.expense,
    };
  }

  /**
   * Calcula projeção anual considerando recorrências
   */
  static async calculateYearlyProjection(
    userId: string,
    branchId: string,
    year: number
  ): Promise<{ income: number; expense: number; balance: number }> {
    // Buscar todas as transações do ano
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const allTransactions = await TransactionRepository.findByBranchId(
      branchId,
      userId,
      {
        start_date: yearStart,
        end_date: yearEnd,
      }
    );

    let totalIncome = 0;
    let totalExpense = 0;

    // Processar cada transação
    for (const transaction of allTransactions) {
      const amount = Number(transaction.amount);

      // Se for recorrente mensal, multiplica por 12
      if (transaction.is_recurring && transaction.recurrence_type === 'monthly') {
        // Calcular quantos meses faltam até o fim do ano a partir da data de vencimento
        const dueDate = new Date(transaction.due_date);
        const monthsRemaining = 12 - dueDate.getMonth(); // getMonth() retorna 0-11

        if (transaction.type === 'income') {
          totalIncome += amount * monthsRemaining;
        } else {
          totalExpense += amount * monthsRemaining;
        }
      }
      // Se for recorrente semanal, multiplica por 52
      else if (transaction.is_recurring && transaction.recurrence_type === 'weekly') {
        const dueDate = new Date(transaction.due_date);
        const today = new Date();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        // Calcular número de semanas restantes no ano
        const weeksInYear = 52;
        const currentWeek = Math.floor((dueDate.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weeksRemaining = weeksInYear - currentWeek;

        if (transaction.type === 'income') {
          totalIncome += amount * weeksRemaining;
        } else {
          totalExpense += amount * weeksRemaining;
        }
      }
      // Se for recorrente anual, adiciona apenas uma vez
      else if (transaction.is_recurring && transaction.recurrence_type === 'yearly') {
        if (transaction.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpense += amount;
        }
      }
      // Para parceladas, conta apenas se não for filha (evita duplicação)
      else if (transaction.installment_type === 'parcelado' && !transaction.parent_transaction_id) {
        // Multiplicar pelo número de parcelas para obter o total
        const installmentsCount = transaction.installments_count || 1;

        if (transaction.type === 'income') {
          totalIncome += amount * installmentsCount;
        } else {
          totalExpense += amount * installmentsCount;
        }
      }
      // Transações únicas e parcelas filhas (que já estão no valor correto)
      else if (!transaction.parent_transaction_id) {
        if (transaction.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpense += amount;
        }
      }
    }

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
