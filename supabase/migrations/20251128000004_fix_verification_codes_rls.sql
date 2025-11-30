-- Remove política antiga de INSERT que requer autenticação
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON public.verification_codes;

-- Permite inserir códigos de verificação sem autenticação
-- Isso é necessário porque criamos códigos durante o processo de login (antes da autenticação)
CREATE POLICY "Allow insert verification codes during login"
  ON public.verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Adiciona política para service role poder gerenciar códigos
CREATE POLICY "Service role can manage verification codes"
  ON public.verification_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
