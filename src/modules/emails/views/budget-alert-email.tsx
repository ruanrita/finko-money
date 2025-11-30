import * as React from "react";

interface BudgetAlertEmailProps {
  userName: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  alertLevel: 80 | 90 | 100;
  month: string;
}

export const BudgetAlertEmailTemplate: React.FC<BudgetAlertEmailProps> = ({
  userName,
  categoryName,
  budgetAmount,
  spentAmount,
  percentage,
  alertLevel,
  month,
}) => {
  const formattedBudget = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(budgetAmount);

  const formattedSpent = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(spentAmount);

  const remaining = budgetAmount - spentAmount;
  const formattedRemaining = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.max(0, remaining));

  // Configuração por nível de alerta
  const alertConfig = {
    80: {
      icon: "⚠️",
      title: "Atenção: Orçamento em 80%",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      borderColor: "#fbbf24",
      message: "Você já utilizou 80% do seu orçamento!",
      tip: "Considere revisar seus gastos para não exceder o orçamento planejado.",
    },
    90: {
      icon: "🚨",
      title: "Alerta: Orçamento em 90%",
      color: "#dc2626",
      bgColor: "#fee2e2",
      borderColor: "#f87171",
      message: "Cuidado! Você já utilizou 90% do seu orçamento!",
      tip: "Evite novos gastos nesta categoria para não estourar o orçamento.",
    },
    100: {
      icon: "🔴",
      title: "Orçamento Excedido!",
      color: "#991b1b",
      bgColor: "#fecaca",
      borderColor: "#dc2626",
      message: "Seu orçamento foi 100% utilizado ou excedido!",
      tip: "Revise suas despesas e considere ajustar seu orçamento para o próximo mês.",
    },
  };

  const config = alertConfig[alertLevel];

  // Formatar mês
  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} de ${year}`;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{config.icon}</span>
        </div>

        <h2 style={styles.title}>{config.title}</h2>

        <p style={styles.paragraph}>Olá, {userName}!</p>

        <p style={styles.paragraph}>{config.message}</p>

        <div
          style={{
            ...styles.alertCard,
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          }}
        >
          <div style={styles.alertHeader}>
            <span style={styles.categoryName}>{categoryName}</span>
            <span style={styles.monthBadge}>{formattedMonth}</span>
          </div>

          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
            <div style={styles.percentageText}>
              <span style={{ ...styles.percentageValue, color: config.color }}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={styles.statsContainer}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Orçamento:</span>
              <span style={styles.statValue}>{formattedBudget}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Gasto:</span>
              <span style={{ ...styles.statValue, color: config.color }}>
                {formattedSpent}
              </span>
            </div>
            <div style={{ ...styles.statRow, borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
              <span style={styles.statLabel}>
                {remaining >= 0 ? "Disponível:" : "Excedido:"}
              </span>
              <span style={{ ...styles.statValue, fontWeight: "bold" as const }}>
                {remaining >= 0 ? formattedRemaining : `-${formattedRemaining}`}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orcamentos`}
            style={styles.button}
          >
            Ver Orçamentos
          </a>
        </div>

        <div style={styles.tipBox}>
          <p style={styles.tipText}>
            💡 <strong>Dica:</strong> {config.tip}
          </p>
        </div>

        <p style={{ ...styles.paragraph, fontSize: "14px", color: "#64748b" }}>
          Este alerta foi configurado por você. Para gerenciar seus alertas,
          acesse a página de orçamentos.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Finko Money. Todos os direitos reservados.
        </p>
        <p style={styles.footerText}>
          Você está recebendo este email porque ativou alertas de orçamento.
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
  alertCard: {
    border: "2px solid",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  categoryName: {
    color: "#1e293b",
    fontSize: "20px",
    fontWeight: "bold" as const,
  },
  monthBadge: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500" as const,
  },
  progressContainer: {
    marginBottom: "16px",
  },
  progressBar: {
    width: "100%",
    height: "24px",
    backgroundColor: "#e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
    borderRadius: "12px",
  },
  percentageText: {
    textAlign: "right" as const,
  },
  percentageValue: {
    fontSize: "20px",
    fontWeight: "bold" as const,
  },
  statsContainer: {
    marginTop: "16px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "14px",
  },
  statValue: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "600" as const,
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
