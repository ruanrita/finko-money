-- Habilita a extensão pg_cron para agendar tarefas
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função para chamar a Edge Function de notificações
CREATE OR REPLACE FUNCTION trigger_notification_processing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Buscar configurações do sistema
  SELECT value INTO function_url
  FROM public.system_config
  WHERE key = 'edge_function_url';

  SELECT value INTO service_role_key
  FROM public.system_config
  WHERE key = 'supabase_service_role_key';

  -- Se não estiver configurado, usar variáveis de ambiente (apenas para desenvolvimento local)
  IF function_url IS NULL THEN
    function_url := current_setting('app.edge_function_url', true);
  END IF;

  IF service_role_key IS NULL THEN
    service_role_key := current_setting('app.supabase_service_role_key', true);
  END IF;

  -- Chamar Edge Function usando http extension
  PERFORM
    net.http_post(
      url := function_url || '/functions/v1/process-notifications',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || service_role_key,
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE NOTICE 'Error calling notification processing: %', SQLERRM;
END;
$$;

-- Agendar execução diária às 8h da manhã (horário do servidor)
-- Cron syntax: minute hour day month weekday
SELECT cron.schedule(
  'process-daily-notifications',    -- Nome do job
  '0 8 * * *',                       -- Todos os dias às 8h
  $$SELECT trigger_notification_processing();$$
);

-- Comentários
COMMENT ON FUNCTION trigger_notification_processing() IS 'Função que chama a Edge Function para processar notificações pendentes (lembretes e alertas de orçamento)';

-- Nota: Para ambientes de produção, você precisa configurar as seguintes variáveis no system_config:
-- INSERT INTO public.system_config (key, value) VALUES
--   ('edge_function_url', 'https://your-project.supabase.co'),
--   ('supabase_service_role_key', 'your-service-role-key');

-- Para verificar os cron jobs configurados:
-- SELECT * FROM cron.job;

-- Para remover um cron job (se necessário):
-- SELECT cron.unschedule('process-daily-notifications');
