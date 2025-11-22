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

  /**
   * Obtém distribuição de despesas/receitas por categoria
   */
  static async getCategoryDistribution(
    userId: string,
    branchId: string,
    startDate: string,
    endDate: string,
    type?: 'income' | 'expense'
  ): Promise<Array<{ category: string; categoryId: string | null; amount: number; color: string; icon: string | null; percentage: number }>> {
    const filters: TransactionFilters = {
      start_date: startDate,
      end_date: endDate,
    };

    if (type) {
      filters.type = type;
    }

    const transactions = await TransactionRepository.findByBranchId(branchId, userId, filters);

    // Agrupar por categoria
    const categoryMap = new Map<string, { amount: number; name: string; color: string; icon: string | null; categoryId: string | null }>();

    for (const transaction of transactions) {
      const categoryId = transaction.category_id || 'sem-categoria';
      const categoryName = (transaction.categories as any)?.name || 'Sem categoria';
      const categoryColor = (transaction.categories as any)?.color || '#6b7280';
      const categoryIcon = (transaction.categories as any)?.icon || null;

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          amount: 0,
          name: categoryName,
          color: categoryColor,
          icon: categoryIcon,
          categoryId: transaction.category_id,
        });
      }

      const current = categoryMap.get(categoryId)!;
      current.amount += Number(transaction.amount);
    }

    // Calcular total para percentuais
    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    // Converter para array e ordenar por valor
    return Array.from(categoryMap.entries())
      .map(([_, data]) => ({
        category: data.name,
        categoryId: data.categoryId,
        amount: data.amount,
        color: data.color,
        icon: data.icon,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Obtém evolução mensal das transações
   */
  static async getMonthlyEvolution(
    userId: string,
    branchId: string,
    monthsCount: number = 6
  ): Promise<Array<{ month: string; monthName: string; income: number; expense: number; balance: number }>> {
    const now = new Date();
    const months: Array<{ month: string; monthName: string; income: number; expense: number; balance: number }> = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const startDate = `${monthStr}-01`;
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const totals = await this.calculateTotals(userId, branchId, startDate, endDate);

      months.push({
        month: monthStr,
        monthName: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        income: totals.income,
        expense: totals.expense,
        balance: totals.balance,
      });
    }

    return months;
  }

  /**
   * Identifica os melhores e piores meses
   */
  static async getBestWorstMonths(
    userId: string,
    branchId: string,
    monthsCount: number = 12
  ): Promise<{
    bestMonth: { month: string; monthName: string; balance: number };
    worstMonth: { month: string; monthName: string; balance: number };
    highestIncome: { month: string; monthName: string; income: number };
    highestExpense: { month: string; monthName: string; expense: number };
  }> {
    const evolution = await this.getMonthlyEvolution(userId, branchId, monthsCount);

    if (evolution.length === 0) {
      const empty = { month: '', monthName: 'N/A', balance: 0, income: 0, expense: 0 };
      return {
        bestMonth: empty,
        worstMonth: empty,
        highestIncome: empty,
        highestExpense: empty,
      };
    }

    const sortedByBalance = [...evolution].sort((a, b) => b.balance - a.balance);
    const sortedByIncome = [...evolution].sort((a, b) => b.income - a.income);
    const sortedByExpense = [...evolution].sort((a, b) => b.expense - a.expense);

    return {
      bestMonth: {
        month: sortedByBalance[0].month,
        monthName: sortedByBalance[0].monthName,
        balance: sortedByBalance[0].balance,
      },
      worstMonth: {
        month: sortedByBalance[sortedByBalance.length - 1].month,
        monthName: sortedByBalance[sortedByBalance.length - 1].monthName,
        balance: sortedByBalance[sortedByBalance.length - 1].balance,
      },
      highestIncome: {
        month: sortedByIncome[0].month,
        monthName: sortedByIncome[0].monthName,
        income: sortedByIncome[0].income,
      },
      highestExpense: {
        month: sortedByExpense[0].month,
        monthName: sortedByExpense[0].monthName,
        expense: sortedByExpense[0].expense,
      },
    };
  }

  /**
   * Calcula métricas resumidas para relatórios
   */
  static async getReportsMetrics(
    userId: string,
    branchId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
    transactionCount: number;
  }> {
    const totals = await this.calculateTotals(userId, branchId, startDate, endDate);
    const transactions = await TransactionRepository.findByBranchId(branchId, userId, {
      start_date: startDate,
      end_date: endDate,
    });

    // Calcular número de meses no período
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

    const savingsRate = totals.income > 0 ? ((totals.income - totals.expense) / totals.income) * 100 : 0;

    return {
      totalIncome: totals.income,
      totalExpense: totals.expense,
      balance: totals.balance,
      savingsRate,
      averageMonthlyIncome: monthsDiff > 0 ? totals.income / monthsDiff : 0,
      averageMonthlyExpense: monthsDiff > 0 ? totals.expense / monthsDiff : 0,
      transactionCount: transactions.length,
    };
  }
}
