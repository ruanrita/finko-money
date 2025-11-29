import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  description: string;
  amount: number;
  dueDate: string | Date;
}

interface PaymentReminderEmailProps {
  userName: string;
  transactions: Transaction[];
}

export const PaymentReminderEmailTemplate: React.FC<
  PaymentReminderEmailProps
> = ({ userName, transactions }) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalAmount);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🔔</span>
        </div>

        <h2 style={styles.title}>Lembrete de Pagamentos</h2>

        <p style={styles.paragraph}>Olá, {userName}!</p>

        <p style={styles.paragraph}>
          Você tem {transactions.length} pagamento
          {transactions.length > 1 ? "s" : ""} próximo
          {transactions.length > 1 ? "s" : ""} do vencimento:
        </p>

        <div style={styles.transactionsContainer}>
          {transactions.map((transaction, index) => {
            const formattedAmount = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(transaction.amount);

            const formattedDate = format(
              typeof transaction.dueDate === "string"
                ? new Date(transaction.dueDate)
                : transaction.dueDate,
              "dd/MM/yyyy",
              { locale: ptBR }
            );

            return (
              <div key={index} style={styles.transactionItem}>
                <div style={styles.transactionHeader}>
                  <span style={styles.transactionDescription}>
                    {transaction.description}
                  </span>
                  <span style={styles.transactionAmount}>{formattedAmount}</span>
                </div>
                <div style={styles.transactionDate}>
                  Vencimento: {formattedDate}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.totalCard}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalValue}>{formattedTotal}</span>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/financeiro`}
            style={styles.button}
          >
            Ver Todas as Transações
          </a>
        </div>

        <div style={styles.tipBox}>
          <p style={styles.tipText}>
            💡 <strong>Dica:</strong> Mantenha suas finanças em dia para evitar
            juros e multas!
          </p>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Finko Money. Todos os direitos reservados.
        </p>
        <p style={styles.footerText}>
          Você está recebendo este email porque ativou lembretes de pagamento.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: "24px",
    textAlign: "center" as const,
  },
  logo: {
    color: "#ffffff",
    margin: "0",
    fontSize: "28px",
    fontWeight: "bold" as const,
  },
  content: {
    padding: "32px 24px",
  },
  iconContainer: {
    textAlign: "center" as const,
    marginBottom: "16px",
  },
  icon: {
    fontSize: "48px",
  },
  title: {
    color: "#1e293b",
    fontSize: "24px",
    marginBottom: "16px",
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  paragraph: {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "16px",
  },
  transactionsContainer: {
    marginBottom: "24px",
  },
  transactionItem: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "12px",
  },
  transactionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  transactionDescription: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "600" as const,
  },
  transactionAmount: {
    color: "#dc2626",
    fontSize: "18px",
    fontWeight: "bold" as const,
  },
  transactionDate: {
    color: "#64748b",
    fontSize: "14px",
  },
  totalCard: {
    backgroundColor: "#f1f5f9",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#1e293b",
    fontSize: "18px",
    fontWeight: "600" as const,
  },
  totalValue: {
    color: "#2563eb",
    fontSize: "24px",
    fontWeight: "bold" as const,
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "12px 32px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600" as const,
    fontSize: "16px",
  },
  tipBox: {
    backgroundColor: "#dbeafe",
    border: "1px solid #93c5fd",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "16px",
  },
  tipText: {
    color: "#1e40af",
    fontSize: "14px",
    margin: "0",
    lineHeight: "20px",
  },
  footer: {
    backgroundColor: "#f1f5f9",
    padding: "24px",
    textAlign: "center" as const,
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    color: "#64748b",
    fontSize: "14px",
    margin: "8px 0",
  },
};
