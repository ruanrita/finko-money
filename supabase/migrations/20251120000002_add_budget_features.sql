-- Adicionar colunas de alertas e rollover à tabela budgets
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS rollover BOOLEAN DEFAULT false;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS alert_80 BOOLEAN DEFAULT true;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS alert_90 BOOLEAN DEFAULT true;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS alert_100 BOOLEAN DEFAULT true;
