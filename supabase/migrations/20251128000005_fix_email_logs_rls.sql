-- Remove políticas antigas de INSERT/UPDATE que só funcionam para service role
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service role can update email logs" ON public.email_logs;

-- Permite inserir logs de email sem autenticação
-- Isso é necessário porque criamos logs durante o processo de login (antes/após autenticação)
CREATE POLICY "Allow insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

-- Permite atualizar logs de email sem autenticação
-- Necessário para atualizar status (sent/failed) após envio
CREATE POLICY "Allow update email logs"
  ON public.email_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
