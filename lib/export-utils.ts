import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  installment_type: "a_vista" | "parcelado";
  installments_count: number | null;
  current_installment: number | null;
  is_recurring: boolean;
  recurrence_type: "monthly" | "weekly" | "yearly" | null;
  tags: string[] | null;
  category_id: string | null;
  categories: {
    name: string;
    color: string;
  } | null;
};

/**
 * Formata os dados da transação para exportação
 */
function formatTransactionForExport(transaction: Transaction) {
  return {
    Data: new Date(transaction.due_date).toLocaleDateString('pt-BR'),
    Tipo: transaction.type === 'income' ? 'Receita' : 'Despesa',
    Descrição: transaction.description,
    Categoria: transaction.categories?.name || 'Sem categoria',
    Valor: `R$ ${Number(transaction.amount).toFixed(2)}`,
    Status: transaction.paid_at ? 'Pago' : 'Pendente',
    'Data Pagamento': transaction.paid_at
      ? new Date(transaction.paid_at).toLocaleDateString('pt-BR')
      : '-',
    'Método de Pagamento': transaction.payment_method || '-',
    Tipo_Parcela: transaction.installment_type === 'a_vista' ? 'À Vista' : 'Parcelado',
    Parcela: transaction.current_installment && transaction.installments_count
      ? `${transaction.current_installment}/${transaction.installments_count}`
      : '-',
    Recorrente: transaction.is_recurring ? 'Sim' : 'Não',
    'Tipo Recorrência': transaction.recurrence_type
      ? transaction.recurrence_type === 'monthly' ? 'Mensal'
        : transaction.recurrence_type === 'weekly' ? 'Semanal'
        : 'Anual'
      : '-',
    Tags: transaction.tags?.join(', ') || '-',
  };
}

/**
 * Exporta transações para CSV
 */
export function exportToCSV(transactions: Transaction[], filename: string = 'transacoes') {
  const data = transactions.map(formatTransactionForExport);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Gerar arquivo CSV
  XLSX.writeFile(wb, `${filename}.csv`);
}

/**
 * Exporta transações para Excel
 */
export function exportToExcel(transactions: Transaction[], filename: string = 'transacoes') {
  const data = transactions.map(formatTransactionForExport);

  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Data
    { wch: 10 }, // Tipo
    { wch: 30 }, // Descrição
    { wch: 20 }, // Categoria
    { wch: 15 }, // Valor
    { wch: 10 }, // Status
    { wch: 15 }, // Data Pagamento
    { wch: 20 }, // Método de Pagamento
    { wch: 12 }, // Tipo_Parcela
    { wch: 10 }, // Parcela
    { wch: 10 }, // Recorrente
    { wch: 15 }, // Tipo Recorrência
    { wch: 25 }, // Tags
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Gerar arquivo Excel
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exporta transações para PDF
 */
export function exportToPDF(transactions: Transaction[], filename: string = 'transacoes') {
  const doc = new jsPDF({ orientation: 'portrait' });

  // Título
  doc.setFontSize(16);
  doc.text('Relatório de Transações', 14, 15);

  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 22);

  // Preparar dados para a tabela
  const tableData = transactions.map(t => {
    const formatted = formatTransactionForExport(t);
    return [
      formatted.Data,
      formatted.Tipo,
      formatted.Descrição,
      formatted.Categoria,
      formatted.Valor,
      formatted.Status,
      formatted['Método de Pagamento'],
      formatted.Tipo_Parcela,
      formatted.Parcela,
    ];
  });

  // Criar tabela
  autoTable(doc, {
    head: [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Status']],
    body: tableData.map(row => [row[0], row[1], row[2], row[3], row[4], row[5]]),
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // brand color (blue)
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 22 }, // Tipo
      2: { cellWidth: 60 }, // Descrição
      3: { cellWidth: 35 }, // Categoria
      4: { cellWidth: 25 }, // Valor
      5: { cellWidth: 20 }, // Status
    },
  });

  // Calcular totais
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Adicionar resumo no final
  const finalY = (doc as any).autoTable?.previous?.finalY || (doc as any).lastAutoTable?.finalY || 28;
  doc.setFontSize(10);
  doc.text('Resumo:', 14, finalY + 10);
  doc.text(`Total de Receitas: R$ ${totalIncome.toFixed(2)}`, 14, finalY + 16);
  doc.text(`Total de Despesas: R$ ${totalExpense.toFixed(2)}`, 14, finalY + 22);
  doc.text(`Saldo: R$ ${balance.toFixed(2)}`, 14, finalY + 28);

  // Salvar PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Gera nome de arquivo baseado no mês selecionado
 */
export function generateFilename(month: string, prefix: string = 'transacoes'): string {
  const [year, monthNum] = month.split('-');
  const monthNames = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const monthName = monthNames[parseInt(monthNum) - 1];

  return `${prefix}_${monthName}_${year}`;
}
