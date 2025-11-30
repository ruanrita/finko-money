import * as React from "react";

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailProps> = ({
  userName,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Bem-vindo, {userName}! 🎉</h2>

        <p style={styles.paragraph}>
          Estamos muito felizes em ter você conosco! Você acabou de dar o
          primeiro passo para ter um controle financeiro mais eficiente e
          organizado.
        </p>

        <p style={styles.paragraph}>
          Com o Finko Money, você pode:
        </p>

        <ul style={styles.list}>
          <li style={styles.listItem}>📊 Controlar suas receitas e despesas</li>
          <li style={styles.listItem}>📈 Visualizar relatórios detalhados</li>
          <li style={styles.listItem}>🔔 Receber lembretes de pagamentos</li>
          <li style={styles.listItem}>💼 Gerenciar múltiplas empresas/filiais</li>
        </ul>

        <div style={styles.buttonContainer}>
          <a href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} style={styles.button}>
            Acessar Plataforma
          </a>
        </div>

        <p style={styles.paragraph}>
          Se você tiver alguma dúvida, não hesite em entrar em contato conosco.
          Estamos aqui para ajudar!
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
  title: {
    color: "#1e293b",
    fontSize: "24px",
    marginBottom: "16px",
    fontWeight: "600" as const,
  },
  paragraph: {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "16px",
  },
  list: {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "28px",
    marginBottom: "24px",
    paddingLeft: "20px",
  },
  listItem: {
    marginBottom: "8px",
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
