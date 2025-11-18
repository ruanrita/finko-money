/**
 * Utilitários para lidar com transações recorrentes
 */

type RecurrenceType = "monthly" | "weekly" | "yearly";

interface RecurringTransaction {
  id: string;
  due_date: string;
  recurrence_type: RecurrenceType;
  is_recurring: boolean;
  [key: string]: any;
}

/**
 * Verifica se uma transação recorrente deve aparecer em um mês específico
 * @param transaction Transação recorrente
 * @param targetMonth Mês alvo no formato "YYYY-MM"
 * @returns true se a transação deve aparecer nesse mês
 */
export function shouldShowInMonth(
  transaction: RecurringTransaction,
  targetMonth: string
): boolean {
  if (!transaction.is_recurring || !transaction.recurrence_type) {
    return false;
  }

  const originalDate = new Date(transaction.due_date);
  const [targetYear, targetMonthNum] = targetMonth.split("-").map(Number);
  const targetDate = new Date(targetYear, targetMonthNum - 1, 1);

  // Só mostrar se o mês alvo for igual ou posterior à data original
  if (targetDate < new Date(originalDate.getFullYear(), originalDate.getMonth(), 1)) {
    return false;
  }

  switch (transaction.recurrence_type) {
    case "monthly":
      // Sempre mostra em todos os meses após a data original
      return true;

    case "weekly":
      // Para semanal, verificar se há uma ocorrência no mês
      const weeklyOccurrences = getWeeklyOccurrencesInMonth(originalDate, targetYear, targetMonthNum - 1);
      return weeklyOccurrences.length > 0;

    case "yearly":
      // Para anual, verificar se o mês coincide
      return originalDate.getMonth() === targetMonthNum - 1;

    default:
      return false;
  }
}

/**
 * Calcula as ocorrências semanais de uma data em um mês específico
 */
function getWeeklyOccurrencesInMonth(
  originalDate: Date,
  year: number,
  month: number
): Date[] {
  const occurrences: Date[] = [];
  const dayOfWeek = originalDate.getDay();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Encontrar o primeiro dia do mês que cai no mesmo dia da semana
  let currentDate = new Date(firstDayOfMonth);
  while (currentDate.getDay() !== dayOfWeek) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Adicionar todas as ocorrências semanais no mês
  while (currentDate <= lastDayOfMonth) {
    if (currentDate >= originalDate) {
      occurrences.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return occurrences;
}

/**
 * Ajusta a data de vencimento de uma transação recorrente para um mês específico
 * @param transaction Transação recorrente original
 * @param targetMonth Mês alvo no formato "YYYY-MM"
 * @returns Data de vencimento ajustada
 */
export function adjustDueDateForMonth(
  transaction: RecurringTransaction,
  targetMonth: string
): string {
  const originalDate = new Date(transaction.due_date);
  const [targetYear, targetMonthNum] = targetMonth.split("-").map(Number);

  if (transaction.recurrence_type === "weekly") {
    // Para semanal, pegar a primeira ocorrência do mês
    const occurrences = getWeeklyOccurrencesInMonth(originalDate, targetYear, targetMonthNum - 1);
    if (occurrences.length > 0) {
      return occurrences[0].toISOString().split("T")[0];
    }
  }

  // Para mensal e anual, manter o mesmo dia
  const originalDay = originalDate.getDate();
  const adjustedDate = new Date(targetYear, targetMonthNum - 1, originalDay);

  // Se o dia não existir no mês (ex: 31 em fevereiro), usar o último dia do mês
  if (adjustedDate.getMonth() !== targetMonthNum - 1) {
    adjustedDate.setDate(0); // Volta para o último dia do mês anterior (que é o alvo)
  }

  return adjustedDate.toISOString().split("T")[0];
}

/**
 * Gera ocorrências virtuais de transações recorrentes para um mês específico
 * @param recurringTransactions Lista de transações recorrentes
 * @param targetMonth Mês alvo no formato "YYYY-MM"
 * @returns Lista de transações virtuais para o mês
 */
export function generateRecurringOccurrences<T extends RecurringTransaction>(
  recurringTransactions: T[],
  targetMonth: string
): T[] {
  const occurrences: T[] = [];

  for (const transaction of recurringTransactions) {
    if (shouldShowInMonth(transaction, targetMonth)) {
      // Criar uma cópia da transação com a data ajustada
      const occurrence = {
        ...transaction,
        due_date: adjustDueDateForMonth(transaction, targetMonth),
        // Adicionar flag para identificar como ocorrência virtual
        is_virtual_occurrence: true,
        original_transaction_id: transaction.id,
      };

      occurrences.push(occurrence as T);
    }
  }

  return occurrences;
}
