-- Add installment_type enum and columns to transactions table

-- Create enum for installment type
CREATE TYPE installment_type AS ENUM ('a_vista', 'parcelado');

-- Add installment_type column to transactions
ALTER TABLE public.transactions
ADD COLUMN installment_type installment_type DEFAULT 'a_vista';

-- Add installments_count column (número de parcelas)
ALTER TABLE public.transactions
ADD COLUMN installments_count INTEGER;

-- Add current_installment column (parcela atual)
ALTER TABLE public.transactions
ADD COLUMN current_installment INTEGER;

-- Add comments
COMMENT ON COLUMN public.transactions.installment_type IS 'Forma de pagamento: à vista ou parcelado';
COMMENT ON COLUMN public.transactions.installments_count IS 'Número total de parcelas (apenas para parcelado)';
COMMENT ON COLUMN public.transactions.current_installment IS 'Número da parcela atual (ex: 1 de 12)';
