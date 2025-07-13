import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalCards: number;
}

export const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalCards: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar estatísticas das transações
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type');

        // Buscar total de cartões
        const { data: creditCards, count: cardsCount } = await supabase
          .from('credit_cards')
          .select('*', { count: 'exact' });

        if (transactions) {
          const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

          setStats({
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            totalCards: cardsCount || 0
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isNegativeBalance = stats.balance < 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(stats.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de entradas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(stats.totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de saídas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Wallet className={`h-4 w-4 ${isNegativeBalance ? 'text-destructive' : 'text-success'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isNegativeBalance ? 'text-destructive' : 'text-success'}`}>
            {formatCurrency(stats.balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {isNegativeBalance ? 'Saldo negativo!' : 'Saldo atual'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cartões</CardTitle>
          <CreditCard className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalCards}
          </div>
          <p className="text-xs text-muted-foreground">
            Cartões cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};