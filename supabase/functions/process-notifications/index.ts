// Edge Function para processar notificações pendentes
// Executado via pg_cron diariamente para enviar lembretes e alertas de orçamento

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'Finko Money <noreply@finko.money>';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: any;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

serve(async (req) => {
  try {
    // Validar requisição (apenas chamadas internas)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Processar lembretes de transações
    await processPaymentReminders(supabase);

    // 2. Processar alertas de orçamento
    await processBudgetAlerts(supabase);

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications processed successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Processa lembretes de pagamento
 * Busca transações pendentes que vencem nos próximos dias e envia lembretes
 */
async function processPaymentReminders(supabase: any) {
  console.log('[Reminders] Starting payment reminders processing...');

  // Buscar lembretes pendentes (transações que vencem nos próximos dias)
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7); // Próximos 7 dias

  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select(`
      id,
      user_id,
      transaction_id,
      days_before,
      sent_at,
      transactions (
        id,
        description,
        amount,
        due_date,
        type,
        paid_at
      )
    `)
    .is('sent_at', null);

  if (remindersError) {
    console.error('[Reminders] Error fetching reminders:', remindersError);
    return;
  }

  console.log(`[Reminders] Found ${reminders?.length || 0} pending reminders`);

  // Agrupar lembretes por usuário
  const remindersByUser = new Map<string, any[]>();

  for (const reminder of reminders || []) {
    const transaction = reminder.transactions;

    // Pular se transação já foi paga
    if (transaction.paid_at) continue;

    // Calcular se deve enviar lembrete
    const dueDate = new Date(transaction.due_date);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Enviar se estiver no prazo configurado
    if (daysDiff <= reminder.days_before && daysDiff >= 0) {
      if (!remindersByUser.has(reminder.user_id)) {
        remindersByUser.set(reminder.user_id, []);
      }
      remindersByUser.get(reminder.user_id)!.push({
        reminderId: reminder.id,
        transaction: {
          description: transaction.description,
          amount: transaction.amount,
          dueDate: transaction.due_date,
        },
      });
    }
  }

  // Enviar emails agrupados por usuário
  for (const [userId, userReminders] of remindersByUser) {
    try {
      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError || !user) {
        console.error(`[Reminders] Error fetching user ${userId}:`, userError);
        continue;
      }

      const transactions = userReminders.map(r => r.transaction);

      // Enviar email via Resend
      await sendPaymentReminderEmail(user.email, user.user_metadata?.full_name || 'Usuário', transactions);

      // Marcar lembretes como enviados
      for (const { reminderId } of userReminders) {
        await supabase
          .from('reminders')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', reminderId);
      }

      // Criar notificação
      await supabase.from('notifications').insert({
        user_id: userId,
        branch_id: (await getCurrentBranch(supabase, userId))?.id,
        type: 'reminder',
        title: `Lembrete: ${transactions.length} pagamento(s) próximo(s)`,
        message: `Você tem ${transactions.length} pagamento(s) vencendo em breve`,
        channel: 'email',
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { transaction_count: transactions.length },
      });

      console.log(`[Reminders] Sent reminder email to ${user.email} with ${transactions.length} transaction(s)`);
    } catch (error) {
      console.error(`[Reminders] Error sending reminder for user ${userId}:`, error);
    }
  }
}

/**
 * Processa alertas de orçamento
 * Verifica orçamentos que atingiram 80%, 90% ou 100% e envia alertas
 */
async function processBudgetAlerts(supabase: any) {
  console.log('[Budget] Starting budget alerts processing...');

  // Buscar orçamentos do mês atual
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      id,
      user_id,
      category_id,
      amount,
      month,
      alert_80,
      alert_90,
      alert_100,
      categories (
        id,
        name,
        branch_id
      )
    `)
    .eq('month', currentMonth);

  if (budgetsError) {
    console.error('[Budget] Error fetching budgets:', budgetsError);
    return;
  }

  console.log(`[Budget] Found ${budgets?.length || 0} budgets for ${currentMonth}`);

  for (const budget of budgets || []) {
    try {
      // Calcular gastos do mês
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const firstDay = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0);
      const lastDayStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      // Buscar transações normais
      const { data: normalTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category_id', budget.category_id)
        .eq('branch_id', budget.categories.branch_id)
        .eq('type', 'expense')
        .eq('is_recurring', false)
        .gte('due_date', firstDay)
        .lte('due_date', lastDayStr);

      // Buscar transações recorrentes
      const { data: recurringTransactions } = await supabase
        .from('transactions')
        .select('amount, due_date, recurrence_type')
        .eq('category_id', budget.category_id)
        .eq('branch_id', budget.categories.branch_id)
        .eq('type', 'expense')
        .eq('is_recurring', true);

      // Filtrar recorrentes do mês
      const filteredRecurring = (recurringTransactions || []).filter((t: any) => {
        const originalDate = new Date(t.due_date);
        const targetDate = new Date(year, monthNum - 1, 1);
        if (targetDate < new Date(originalDate.getFullYear(), originalDate.getMonth(), 1)) {
          return false;
        }
        if (t.recurrence_type === 'yearly') {
          return originalDate.getMonth() === monthNum - 1;
        }
        return true; // monthly e weekly
      });

      const totalSpent = [...(normalTransactions || []), ...filteredRecurring]
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const percentage = (totalSpent / Number(budget.amount)) * 100;

      // Verificar se precisa enviar alerta
      let alertLevel: 80 | 90 | 100 | null = null;

      if (percentage >= 100 && budget.alert_100) {
        alertLevel = 100;
      } else if (percentage >= 90 && budget.alert_90) {
        alertLevel = 90;
      } else if (percentage >= 80 && budget.alert_80) {
        alertLevel = 80;
      }

      if (!alertLevel) continue;

      // Verificar se já foi enviado alerta deste nível no mês
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', budget.user_id)
        .eq('type', `budget_alert_${alertLevel}`)
        .eq('metadata->>budget_id', budget.id)
        .eq('metadata->>month', currentMonth)
        .single();

      if (existingNotification) {
        console.log(`[Budget] Alert ${alertLevel}% already sent for budget ${budget.id}`);
        continue;
      }

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(budget.user_id);

      if (userError || !user) {
        console.error(`[Budget] Error fetching user ${budget.user_id}:`, userError);
        continue;
      }

      // Enviar email de alerta
      await sendBudgetAlertEmail(
        user.email,
        user.user_metadata?.full_name || 'Usuário',
        budget.categories.name,
        Number(budget.amount),
        totalSpent,
        percentage,
        alertLevel,
        currentMonth
      );

      // Criar notificação
      await supabase.from('notifications').insert({
        user_id: budget.user_id,
        branch_id: budget.categories.branch_id,
        type: `budget_alert_${alertLevel}`,
        title: `Alerta: Orçamento em ${alertLevel}%`,
        message: `Seu orçamento de ${budget.categories.name} atingiu ${percentage.toFixed(0)}%`,
        channel: 'email',
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          budget_id: budget.id,
          category_name: budget.categories.name,
          alert_level: alertLevel,
          percentage: percentage,
          month: currentMonth,
        },
      });

      console.log(`[Budget] Sent ${alertLevel}% alert for budget ${budget.id} (${budget.categories.name})`);
    } catch (error) {
      console.error(`[Budget] Error processing budget ${budget.id}:`, error);
    }
  }
}

/**
 * Envia email de lembrete de pagamento via Resend
 */
async function sendPaymentReminderEmail(
  to: string,
  userName: string,
  transactions: Array<{ description: string; amount: number; dueDate: string }>
) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalAmount);

  const transactionsHtml = transactions.map(t => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(t.amount);
    const date = new Date(t.dueDate).toLocaleDateString('pt-BR');

    return `
      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${t.description}</span>
          <span style="color: #dc2626; font-size: 18px; font-weight: bold;">${formatted}</span>
        </div>
        <div style="color: #64748b; font-size: 14px;">Vencimento: ${date}</div>
      </div>
    `;
  }).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background-color: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Finko Money</h1>
      </div>
      <div style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="font-size: 48px;">🔔</span>
        </div>
        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px; font-weight: 600; text-align: center;">Lembrete de Pagamentos</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 16px;">Olá, ${userName}!</p>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
          Você tem ${transactions.length} pagamento${transactions.length > 1 ? 's' : ''} próximo${transactions.length > 1 ? 's' : ''} do vencimento:
        </p>
        ${transactionsHtml}
        <div style="background-color: #f1f5f9; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #1e293b; font-size: 18px; font-weight: 600;">Total:</span>
            <span style="color: #2563eb; font-size: 24px; font-weight: bold;">${formattedTotal}</span>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/financeiro" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Ver Todas as Transações
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin: 8px 0;">© ${new Date().getFullYear()} Finko Money. Todos os direitos reservados.</p>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject: 'Lembrete de Pagamentos - Finko Money',
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

/**
 * Envia email de alerta de orçamento via Resend
 */
async function sendBudgetAlertEmail(
  to: string,
  userName: string,
  categoryName: string,
  budgetAmount: number,
  spentAmount: number,
  percentage: number,
  alertLevel: 80 | 90 | 100,
  month: string
) {
  const formattedBudget = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(budgetAmount);

  const formattedSpent = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(spentAmount);

  const remaining = budgetAmount - spentAmount;
  const formattedRemaining = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.max(0, Math.abs(remaining)));

  const alertConfig = {
    80: { icon: '⚠️', title: 'Atenção: Orçamento em 80%', color: '#f59e0b', bgColor: '#fef3c7', borderColor: '#fbbf24' },
    90: { icon: '🚨', title: 'Alerta: Orçamento em 90%', color: '#dc2626', bgColor: '#fee2e2', borderColor: '#f87171' },
    100: { icon: '🔴', title: 'Orçamento Excedido!', color: '#991b1b', bgColor: '#fecaca', borderColor: '#dc2626' },
  };

  const config = alertConfig[alertLevel];

  const [year, monthNum] = month.split('-');
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} de ${year}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background-color: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Finko Money</h1>
      </div>
      <div style="padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="font-size: 48px;">${config.icon}</span>
        </div>
        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px; font-weight: 600; text-align: center;">${config.title}</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 16px;">Olá, ${userName}!</p>
        <div style="background-color: ${config.bgColor}; border: 2px solid ${config.borderColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="color: #1e293b; font-size: 20px; font-weight: bold;">${categoryName}</span>
            <span style="background-color: #e2e8f0; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${formattedMonth}</span>
          </div>
          <div style="width: 100%; height: 24px; background-color: #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <div style="height: 100%; width: ${Math.min(percentage, 100)}%; background-color: ${config.color}; border-radius: 12px;"></div>
          </div>
          <div style="text-align: right; margin-bottom: 16px;">
            <span style="font-size: 20px; font-weight: bold; color: ${config.color};">${percentage.toFixed(0)}%</span>
          </div>
          <div style="color: #64748b; font-size: 14px; margin-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Orçamento:</span>
              <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${formattedBudget}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Gasto:</span>
              <span style="color: ${config.color}; font-size: 16px; font-weight: 600;">${formattedSpent}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <span>${remaining >= 0 ? 'Disponível:' : 'Excedido:'}</span>
              <span style="color: #1e293b; font-size: 16px; font-weight: bold;">${remaining >= 0 ? formattedRemaining : `-${formattedRemaining}`}</span>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/orcamentos" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Ver Orçamentos
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin: 8px 0;">© ${new Date().getFullYear()} Finko Money. Todos os direitos reservados.</p>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject: `${config.title} - ${categoryName} - Finko Money`,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

/**
 * Busca o branch atual do usuário
 */
async function getCurrentBranch(supabase: any, userId: string) {
  const { data } = await supabase
    .from('branches')
    .select('id')
    .eq('user_id', userId)
    .eq('is_personal', true)
    .single();

  return data;
}
