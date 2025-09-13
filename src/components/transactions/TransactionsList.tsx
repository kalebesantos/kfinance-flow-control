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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { TransactionDialog } from "./TransactionDialog";
import { useToast } from "@/hooks/use-toast";
import { mockData } from "@/store/mockData";
import { formatCurrency } from "@/utils/currency";

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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Buscar dados mockados
      const allTransactions = mockData.getTransactions();
      const allCategories = mockData.getCategories();
      const allCards = mockData.getCreditCards();
      
      // Enriquecer transações com dados relacionados
      const enrichedTransactions = allTransactions.map(t => {
        const category = allCategories.find(c => c.id === t.category_id);
        const card = allCards.find(c => c.id === t.credit_card_id);
        
        return {
          ...t,
          categories: category ? { name: category.name, color: category.color } : null,
          credit_cards: card ? { name: card.name } : null
        };
      });
      
      // Ordenar por data (mais recente primeiro)
      enrichedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Aplicar limite se especificado
      const finalTransactions = limit 
        ? enrichedTransactions.slice(0, limit) 
        : enrichedTransactions;
      
      setTransactions(finalTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });

      fetchTransactions();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    } finally {
      setDeletingTransactionId(null);
    }
  };

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
                  {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeletingTransactionId(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog de Edição */}
      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSuccess={() => {
          setEditingTransaction(null);
          fetchTransactions();
        }}
        editTransaction={editingTransaction}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingTransactionId} onOpenChange={(open) => !open && setDeletingTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingTransactionId && handleDelete(deletingTransactionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};