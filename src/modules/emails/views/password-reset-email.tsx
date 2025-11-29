import * as React from "react";

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
}

export const PasswordResetEmailTemplate: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Finko Money</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Redefinição de Senha</h2>

        <p style={styles.paragraph}>Olá, {userName}!</p>

        <p style={styles.paragraph}>
          Recebemos uma solicitação para redefinir a senha da sua conta. Se você
          fez essa solicitação, clique no botão abaixo para criar uma nova senha:
        </p>

        <div style={styles.buttonContainer}>
          <a href={resetLink} style={styles.button}>
            Redefinir Senha
          </a>
        </div>

        <p style={styles.paragraph}>
          Ou copie e cole este link no seu navegador:
        </p>

        <div style={styles.linkBox}>
          <a href={resetLink} style={styles.link}>
            {resetLink}
          </a>
        </div>

        <div style={styles.warningBox}>
          <p style={styles.warningText}>
            ⚠️ <strong>Atenção:</strong> Este link expira em 1 hora por motivos
            de segurança.
          </p>
        </div>

        <p style={styles.paragraph}>
          Se você não solicitou a redefinição de senha, por favor ignore este
          email. Sua senha permanecerá inalterada.
        </p>

        <p style={styles.paragraph}>
          Por segurança, nunca compartilhe este link com outras pessoas.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Finko Money. Todos os direitos reservados.
        </p>
        <p style={styles.footerText}>
          Se você tiver dúvidas, entre em contato com nosso suporte.
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
  linkBox: {
    backgroundColor: "#f1f5f9",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "24px",
    wordBreak: "break-all" as const,
  },
  link: {
    color: "#2563eb",
    fontSize: "14px",
    textDecoration: "none",
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
