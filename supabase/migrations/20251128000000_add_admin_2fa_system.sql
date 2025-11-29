-- Add is_admin field to users table
ALTER TABLE public.users
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create verification_codes table for 2FA
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '2fa', -- '2fa', 'password_reset', etc
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Create email_logs table to track all sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'welcome', '2fa', 'transaction_confirmation', etc
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  resend_id TEXT, -- ID retornado pelo Resend
  metadata JSONB, -- Dados adicionais (ex: transaction_id, amount, etc)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);
CREATE INDEX idx_verification_codes_type ON public.verification_codes(type);
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at);

-- Create function to clean up expired verification codes (para ser executado periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_codes (apenas o próprio usuário pode ver seus códigos)
CREATE POLICY "Users can view their own verification codes"
  ON public.verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification codes"
  ON public.verification_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification codes"
  ON public.verification_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for email_logs (apenas admins podem ver todos os logs)
CREATE POLICY "Users can view their own email logs"
  ON public.email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email logs"
  ON public.email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- System can insert email logs (service role)
CREATE POLICY "Service role can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update email logs"
  ON public.email_logs
  FOR UPDATE
  USING (true);

-- Comment on tables and columns for documentation
COMMENT ON TABLE public.verification_codes IS 'Stores verification codes for 2FA and other verification purposes';
COMMENT ON TABLE public.email_logs IS 'Tracks all emails sent by the system for monitoring and analytics';
COMMENT ON COLUMN public.users.is_admin IS 'Indicates if the user has admin privileges';
