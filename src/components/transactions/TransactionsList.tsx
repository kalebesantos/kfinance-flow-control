import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

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
  categories: { name: string; color: string } | null;
  credit_cards: { name: string } | null;
}

interface TransactionsListProps {
  limit?: number;
}

export const TransactionsList = ({ limit }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let query = supabase
          .from('transactions')
          .select(`
            id,
            date,
            description,
            amount,
            type,
            payment_method,
            status,
            is_installment,
            current_installment,
            installment_count,
            categories (name, color),
            credit_cards (name)
          `)
          .order('date', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar transações:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [limit]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      transfer: 'Transferência'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge variant="outline" className="bg-success/10 text-success border-success">Pago</Badge>;
    }
    return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pendente</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'income') {
      return <Badge variant="outline" className="bg-success/10 text-success border-success">Entrada</Badge>;
    }
    return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Saída</Badge>;
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Carregando...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.is_installment && (
                    <p className="text-xs text-muted-foreground">
                      Parcela {transaction.current_installment}/{transaction.installment_count}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {transaction.categories && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: transaction.categories.color }}
                    />
                    <span className="text-sm">{transaction.categories.name}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                {getTypeBadge(transaction.type)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {transaction.payment_method === 'credit_card' && (
                    <CreditCard className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm">{getPaymentMethodLabel(transaction.payment_method)}</span>
                </div>
                {transaction.credit_cards && (
                  <p className="text-xs text-muted-foreground">{transaction.credit_cards.name}</p>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(transaction.status)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};