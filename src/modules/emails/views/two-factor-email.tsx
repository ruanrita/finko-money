import * as React from "react";

interface TwoFactorEmailProps {
  userName: string;
  code: string;
  expiresInMinutes: number;
}

export const TwoFactorEmailTemplate: React.FC<TwoFactorEmailProps> = ({
  userName,
  code,
  expiresInMinutes,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🔐</span>
        </div>

        <h2 style={styles.title}>Código de Verificação</h2>

        <p style={styles.paragraph}>Olá, {userName}!</p>

        <p style={styles.paragraph}>
          Você está fazendo login como <strong>Administrador</strong>. Por
          segurança, precisamos verificar sua identidade.
        </p>

        <p style={styles.paragraph}>
          Use o código abaixo para completar seu login:
        </p>

        <div style={styles.codeContainer}>
          <div style={styles.codeBox}>
            <span style={styles.code}>{code}</span>
          </div>
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            ⏱️ Este código expira em <strong>{expiresInMinutes} minutos</strong>
          </p>
        </div>

        <div style={styles.warningBox}>
          <p style={styles.warningText}>
            ⚠️ <strong>Importante:</strong> Se você não tentou fazer login, ignore
            este email e altere sua senha imediatamente.
          </p>
        </div>

        <p style={styles.paragraph}>
          Por segurança, nunca compartilhe este código com outras pessoas.
        </p>

        <div style={styles.tipsBox}>
          <h3 style={styles.tipsTitle}>Dicas de Segurança:</h3>
          <ul style={styles.tipsList}>
            <li style={styles.tipsItem}>Nunca compartilhe seu código de verificação</li>
            <li style={styles.tipsItem}>Use uma senha forte e única</li>
            <li style={styles.tipsItem}>Ative a autenticação de dois fatores quando disponível</li>
            <li style={styles.tipsItem}>Sempre faça logout em computadores compartilhados</li>
          </ul>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Finko Money. Todos os direitos reservados.
        </p>
        <p style={styles.footerText}>
          Este é um email de segurança automático. Não responda a esta mensagem.
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
  codeContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  codeBox: {
    display: "inline-block",
    backgroundColor: "#f8fafc",
    border: "3px dashed #2563eb",
    borderRadius: "12px",
    padding: "24px 48px",
  },
  code: {
    fontSize: "48px",
    fontWeight: "bold" as const,
    color: "#2563eb",
    letterSpacing: "8px",
    fontFamily: "Monaco, Courier New, monospace",
  },
  infoBox: {
    backgroundColor: "#dbeafe",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "24px",
    textAlign: "center" as const,
  },
  infoText: {
    color: "#1e40af",
    fontSize: "14px",
    margin: "0",
    lineHeight: "20px",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "24px",
  },
  warningText: {
    color: "#92400e",
    fontSize: "14px",
    margin: "0",
    lineHeight: "20px",
  },
  tipsBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "24px",
  },
  tipsTitle: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "600" as const,
    marginBottom: "12px",
    marginTop: "0",
  },
  tipsList: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0",
    paddingLeft: "20px",
  },
  tipsItem: {
    marginBottom: "8px",
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
