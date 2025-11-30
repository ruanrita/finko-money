-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'reminder', 'budget_alert_80', 'budget_alert_90', 'budget_alert_100'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email', 'notification', 'api', 'whatsapp'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  metadata JSONB, -- Dados adicionais (reminder_id, budget_id, etc)
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_branch_id ON public.notifications(branch_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem marcar suas notificações como lidas
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role pode criar notificações (via Edge Functions)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Service role pode atualizar notificações (marcar como enviadas)
CREATE POLICY "Service role can update notifications"
  ON public.notifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- Comentários
COMMENT ON TABLE public.notifications IS 'Tabela de notificações do sistema (emails, lembretes, alertas)';
COMMENT ON COLUMN public.notifications.type IS 'Tipo de notificação: reminder, budget_alert_80, budget_alert_90, budget_alert_100';
COMMENT ON COLUMN public.notifications.channel IS 'Canal de envio: email, notification, api, whatsapp';
COMMENT ON COLUMN public.notifications.status IS 'Status: pending, sent, failed, read';
COMMENT ON COLUMN public.notifications.metadata IS 'Dados adicionais em JSON (reminder_id, budget_id, alert_percentage, etc)';
