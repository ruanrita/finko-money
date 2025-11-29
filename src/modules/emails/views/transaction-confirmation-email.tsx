import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionConfirmationEmailProps {
  userName: string;
  transactionType: "income" | "expense";
  amount: number;
  description: string;
  date: string | Date;
}

export const TransactionConfirmationEmailTemplate: React.FC<
  TransactionConfirmationEmailProps
> = ({ userName, transactionType, amount, description, date }) => {
  const isIncome = transactionType === "income";
  const typeLabel = isIncome ? "Receita" : "Despesa";
  const typeEmoji = isIncome ? "💰" : "💳";
  const typeColor = isIncome ? "#10b981" : "#ef4444";

  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  const formattedDate = format(
    typeof date === "string" ? new Date(date) : date,
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{typeEmoji}</span>
        </div>

        <h2 style={styles.title}>{typeLabel} Registrada!</h2>

        <p style={styles.paragraph}>Olá, {userName}!</p>

        <p style={styles.paragraph}>
          Uma nova {typeLabel.toLowerCase()} foi registrada em sua conta:
        </p>

        <div style={styles.transactionCard}>
          <div style={styles.transactionRow}>
            <span style={styles.transactionLabel}>Descrição:</span>
            <span style={styles.transactionValue}>{description}</span>
          </div>

          <div style={styles.transactionRow}>
            <span style={styles.transactionLabel}>Valor:</span>
            <span style={{ ...styles.transactionValue, color: typeColor, fontWeight: "bold" as const }}>
              {formattedAmount}
            </span>
          </div>

          <div style={styles.transactionRow}>
            <span style={styles.transactionLabel}>Data:</span>
            <span style={styles.transactionValue}>{formattedDate}</span>
          </div>

          <div style={styles.transactionRow}>
            <span style={styles.transactionLabel}>Tipo:</span>
            <span style={{ ...styles.transactionValue, color: typeColor }}>
              {typeLabel}
            </span>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/financeiro`}
            style={styles.button}
          >
            Ver Transações
          </a>
        </div>

        <p style={styles.paragraph}>
          Você pode visualizar todos os detalhes desta transação em sua conta.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Finko Money. Todos os direitos reservados.
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
  transactionCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
  },
  transactionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  transactionLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500" as const,
  },
  transactionValue: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "500" as const,
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
  footer: {
    backgroundColor: "#f1f5f9",
    padding: "24px",
    textAlign: "center" as const,
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0",
  },
};
