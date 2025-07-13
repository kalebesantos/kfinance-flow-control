import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CalendarDays, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyData: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

export const MonthlyReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryData: [],
    dailyData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
        const monthEnd = endOfMonth(new Date(selectedMonth + '-01'));

        // Buscar transações do mês
        const { data: transactions } = await supabase
          .from('transactions')
          .select(`
            amount,
            type,
            date,
            categories (name, color)
          `)
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'));

        if (transactions) {
          // Calcular totais
          const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

          // Agrupar por categoria (apenas despesas)
          const categoryMap = new Map();
          transactions
            .filter(t => t.type === 'expense' && t.categories)
            .forEach(t => {
              const categoryName = t.categories!.name;
              const existing = categoryMap.get(categoryName) || 0;
              categoryMap.set(categoryName, existing + Number(t.amount));
            });

          const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => {
            const category = transactions.find(t => t.categories?.name === name)?.categories;
            return {
              name,
              value: value as number,
              color: category?.color || '#A020F0'
            };
          });

          // Agrupar por dia
          const dailyMap = new Map();
          transactions.forEach(t => {
            const date = t.date;
            const existing = dailyMap.get(date) || { income: 0, expense: 0 };
            if (t.type === 'income') {
              existing.income += Number(t.amount);
            } else {
              existing.expense += Number(t.amount);
            }
            dailyMap.set(date, existing);
          });

          const dailyData = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
              date: format(new Date(date), 'dd/MM'),
              ...data as { income: number; expense: number }
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

          setMonthlyData({
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            categoryData,
            dailyData
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados mensais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label });
    }
    return options;
  };

  const isNegativeBalance = monthlyData.balance < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Relatório Mensal
              </CardTitle>
              <CardDescription>
                Análise detalhada das movimentações financeiras
              </CardDescription>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(monthlyData.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(monthlyData.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            {isNegativeBalance ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isNegativeBalance ? 'text-destructive' : 'text-success'}`}>
              {formatCurrency(monthlyData.balance)}
            </div>
            {isNegativeBalance && (
              <p className="text-xs text-destructive mt-1">⚠️ Saldo negativo!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Categories */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos gastos mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : monthlyData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={monthlyData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monthlyData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Daily */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Movimentação Diária</CardTitle>
            <CardDescription>
              Entradas e saídas por dia do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : monthlyData.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" fill="#2ECC71" name="Receitas" />
                  <Bar dataKey="expense" fill="#E74C3C" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma movimentação encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};