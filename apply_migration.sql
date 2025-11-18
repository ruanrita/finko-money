-- Script para aplicar migration manualmente
-- Execute este arquivo no Supabase Studio (http://localhost:54323)
-- Vá em SQL Editor e cole este conteúdo

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Criar enum se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installment_type') THEN
        CREATE TYPE installment_type AS ENUM ('a_vista', 'parcelado');
    END IF;

    -- Adicionar coluna installment_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions'
                   AND column_name = 'installment_type') THEN
        ALTER TABLE public.transactions
        ADD COLUMN installment_type installment_type DEFAULT 'a_vista';
    END IF;

    -- Adicionar coluna installments_count se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions'
                   AND column_name = 'installments_count') THEN
        ALTER TABLE public.transactions
        ADD COLUMN installments_count INTEGER;
    END IF;

    -- Adicionar coluna current_installment se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions'
                   AND column_name = 'current_installment') THEN
        ALTER TABLE public.transactions
        ADD COLUMN current_installment INTEGER;
    END IF;
END $$;

-- Adicionar comentários
COMMENT ON COLUMN public.transactions.installment_type IS 'Forma de pagamento: à vista ou parcelado';
COMMENT ON COLUMN public.transactions.installments_count IS 'Número total de parcelas (apenas para parcelado)';
COMMENT ON COLUMN public.transactions.current_installment IS 'Número da parcela atual (ex: 1 de 12)';

-- Verificar se funcionou
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name IN ('installment_type', 'installments_count', 'current_installment');
