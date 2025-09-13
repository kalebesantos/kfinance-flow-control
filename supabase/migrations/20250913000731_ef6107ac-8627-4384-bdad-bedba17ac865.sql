-- Adicionar colunas faltantes na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'transfer')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_count INTEGER DEFAULT 1 CHECK (installment_count >= 1),
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);