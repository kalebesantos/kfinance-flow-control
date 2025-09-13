// Store mockado em memória para demonstração
// Em produção, isso seria substituído pelo Supabase com autenticação

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  payment_method: string;
  status: 'paid' | 'pending';
  is_installment: boolean;
  current_installment: number;
  installment_count: number;
  category_id?: string;
  credit_card_id?: string;
  due_date?: string;
  notes?: string;
}

interface CreditCard {
  id: string;
  name: string;
  limit_total: number;
  closing_day: number;
  due_day: number;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

// Dados iniciais mockados
let transactions: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    description: 'Supermercado Extra',
    amount: 250.50,
    type: 'expense',
    payment_method: 'credit_card',
    status: 'paid',
    is_installment: false,
    current_installment: 1,
    installment_count: 1,
    category_id: '1',
    credit_card_id: '1'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    description: 'Salário',
    amount: 5000.00,
    type: 'income',
    payment_method: 'transfer',
    status: 'paid',
    is_installment: false,
    current_installment: 1,
    installment_count: 1,
    category_id: '9'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    description: 'Conta de Luz',
    amount: 180.00,
    type: 'expense',
    payment_method: 'pix',
    status: 'pending',
    is_installment: false,
    current_installment: 1,
    installment_count: 1,
    category_id: '3'
  }
];

let creditCards: CreditCard[] = [
  {
    id: '1',
    name: 'Nubank',
    limit_total: 5000,
    closing_day: 15,
    due_day: 22
  },
  {
    id: '2',
    name: 'Inter',
    limit_total: 3000,
    closing_day: 10,
    due_day: 17
  }
];

const categories: Category[] = [
  // Categorias de despesa
  { id: '1', name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { id: '2', name: 'Transporte', type: 'expense', color: '#f59e0b', icon: 'car' },
  { id: '3', name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
  { id: '4', name: 'Saúde', type: 'expense', color: '#10b981', icon: 'heart' },
  { id: '5', name: 'Educação', type: 'expense', color: '#3b82f6', icon: 'graduation-cap' },
  { id: '6', name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'gamepad' },
  { id: '7', name: 'Compras', type: 'expense', color: '#f97316', icon: 'shopping-cart' },
  { id: '8', name: 'Outros', type: 'expense', color: '#6b7280', icon: 'ellipsis' },
  // Categorias de receita
  { id: '9', name: 'Salário', type: 'income', color: '#10b981', icon: 'wallet' },
  { id: '10', name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'briefcase' },
  { id: '11', name: 'Investimentos', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
  { id: '12', name: 'Outros', type: 'income', color: '#6b7280', icon: 'ellipsis' },
];

// Funções para simular operações CRUD
export const mockData = {
  // Transações
  getTransactions: () => [...transactions],
  
  getTransaction: (id: string) => transactions.find(t => t.id === id),
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    transactions.push(newTransaction);
    return newTransaction;
  },
  
  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      return transactions[index];
    }
    return null;
  },
  
  deleteTransaction: (id: string) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      return true;
    }
    return false;
  },

  // Cartões de Crédito
  getCreditCards: () => [...creditCards],
  
  getCreditCard: (id: string) => creditCards.find(c => c.id === id),
  
  addCreditCard: (card: Omit<CreditCard, 'id'>) => {
    const newCard = {
      ...card,
      id: Date.now().toString()
    };
    creditCards.push(newCard);
    return newCard;
  },
  
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => {
    const index = creditCards.findIndex(c => c.id === id);
    if (index !== -1) {
      creditCards[index] = { ...creditCards[index], ...updates };
      return creditCards[index];
    }
    return null;
  },
  
  deleteCreditCard: (id: string) => {
    const index = creditCards.findIndex(c => c.id === id);
    if (index !== -1) {
      creditCards.splice(index, 1);
      return true;
    }
    return false;
  },

  // Categorias
  getCategories: () => [...categories],
  
  getCategory: (id: string) => categories.find(c => c.id === id)
};