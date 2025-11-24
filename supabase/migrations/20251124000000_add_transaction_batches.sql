-- Migration: Add transaction_batches table
-- Description: Creates a table to group related transactions together for better management
-- Supports different batch types: installments, recurring, etc.
-- This enables features like: amortization, batch editing, cancellation, and reporting

-- Create transaction_batches table
CREATE TABLE IF NOT EXISTS public.transaction_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,

  -- Batch type (extensible for future features)
  batch_type TEXT NOT NULL DEFAULT 'installments' CHECK (batch_type IN ('installments')),

  -- Basic information
  description TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL, -- Valor total original (ex: 30000)
  installments_count INTEGER CHECK (installments_count > 0), -- Número total de parcelas (ex: 24) - NULL for non-installment batches
  installment_amount DECIMAL(12, 2), -- Valor de cada parcela (ex: 1250) - NULL for non-installment batches

  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'boleto', 'credito', 'debito', 'dinheiro', 'transferencia')),

  -- Dates
  first_due_date DATE NOT NULL, -- Data da primeira parcela
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT, -- Notas adicionais sobre o parcelamento

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  paid_installments INTEGER DEFAULT 0, -- Quantas parcelas já foram pagas

  -- Amortization tracking
  original_total_amount DECIMAL(12, 2) NOT NULL, -- Valor original (para histórico de amortizações)
  amortized_amount DECIMAL(12, 2) DEFAULT 0, -- Valor já amortizado
  last_amortization_date TIMESTAMPTZ -- Data da última amortização
);

-- Add index for performance
CREATE INDEX idx_transaction_batches_user_branch ON public.transaction_batches(user_id, branch_id);
CREATE INDEX idx_transaction_batches_status ON public.transaction_batches(status);
CREATE INDEX idx_transaction_batches_type ON public.transaction_batches(type);
CREATE INDEX idx_transaction_batches_batch_type ON public.transaction_batches(batch_type);
CREATE INDEX idx_transaction_batches_first_due_date ON public.transaction_batches(first_due_date);

-- Add batch_id column to transactions table to link them
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.transaction_batches(id) ON DELETE CASCADE;

-- Add index for batch_id
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON public.transactions(batch_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_transaction_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transaction_batches_updated_at
  BEFORE UPDATE ON public.transaction_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_batches_updated_at();

-- RLS Policies
ALTER TABLE public.transaction_batches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own batches
CREATE POLICY "Users can view own transaction batches"
  ON public.transaction_batches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own batches
CREATE POLICY "Users can create own transaction batches"
  ON public.transaction_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own batches
CREATE POLICY "Users can update own transaction batches"
  ON public.transaction_batches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own batches
CREATE POLICY "Users can delete own transaction batches"
  ON public.transaction_batches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.transaction_batches IS 'Groups related transactions together (installments, recurring, etc.) for tracking, amortization, and management';
COMMENT ON COLUMN public.transaction_batches.batch_type IS 'Type of batch: installments (for installment payments), can be extended in the future';
COMMENT ON COLUMN public.transaction_batches.total_amount IS 'Original total amount of the batch (e.g., 30000 for a loan)';
COMMENT ON COLUMN public.transaction_batches.installment_amount IS 'Amount per installment (total_amount / installments_count) - only for installment batches';
COMMENT ON COLUMN public.transaction_batches.amortized_amount IS 'Total amount amortized so far - only for installment batches';
COMMENT ON COLUMN public.transaction_batches.paid_installments IS 'Number of installments already paid - only for installment batches';
