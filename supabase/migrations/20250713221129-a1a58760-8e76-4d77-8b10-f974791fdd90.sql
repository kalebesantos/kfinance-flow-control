-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#A020F0',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cartões de crédito
CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  limit_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos ENUM
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'pix', 'transfer');
CREATE TYPE transaction_status AS ENUM ('paid', 'pending');

-- Tabela de transações/lançamentos
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type transaction_type NOT NULL,
  payment_method payment_method NOT NULL,
  status transaction_status DEFAULT 'pending',
  is_installment BOOLEAN DEFAULT FALSE,
  installment_count INTEGER DEFAULT 1,
  current_installment INTEGER DEFAULT 1,
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_installment CHECK (
    (is_installment = FALSE AND installment_count = 1 AND current_installment = 1) OR
    (is_installment = TRUE AND installment_count > 1 AND current_installment <= installment_count)
  )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categories (name, color, icon) VALUES
('Alimentação', '#FF6B6B', 'utensils'),
('Transporte', '#4ECDC4', 'car'),
('Moradia', '#45B7D1', 'home'),
('Saúde', '#96CEB4', 'heart'),
('Educação', '#FECA57', 'book'),
('Lazer', '#FF9FF3', 'gamepad2'),
('Roupas', '#54A0FF', 'shirt'),
('Eletrônicos', '#5F27CD', 'smartphone'),
('Outros', '#DDA0DD', 'more-horizontal'),
('Salário', '#2ECC71', 'dollar-sign'),
('Freelance', '#3498DB', 'briefcase'),
('Investimentos', '#E74C3C', 'trending-up');

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permissivo para desenvolvimento - pode ser refinado depois)
CREATE POLICY "Todos podem ver categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "Todos podem inserir categorias" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar categorias" ON categories FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar categorias" ON categories FOR DELETE USING (true);

CREATE POLICY "Todos podem ver cartões" ON credit_cards FOR SELECT USING (true);
CREATE POLICY "Todos podem inserir cartões" ON credit_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar cartões" ON credit_cards FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar cartões" ON credit_cards FOR DELETE USING (true);

CREATE POLICY "Todos podem ver transações" ON transactions FOR SELECT USING (true);
CREATE POLICY "Todos podem inserir transações" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar transações" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar transações" ON transactions FOR DELETE USING (true);

-- Índices para performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_credit_card ON transactions(credit_card_id);
CREATE INDEX idx_transactions_parent ON transactions(parent_transaction_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);