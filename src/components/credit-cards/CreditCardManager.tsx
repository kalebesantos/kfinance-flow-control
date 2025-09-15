import { useEffect, useState } from "react";
import { Plus, CreditCard, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { mockData } from "@/store/mockData";
import { CreditCardDialog } from "./CreditCardDialog";
import { useToast } from "@/hooks/use-toast";

interface CreditCard {
  id: string;
  name: string;
  limit_total: number;
  closing_day: number;
  due_day: number;
  used_amount: number;
  available_amount: number;
  current_invoice: number;
}

export const CreditCardManager = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const fetchCreditCards = async () => {
    try {
      // Buscar cartões do mock e calcular uso a partir das transações mockadas
      const cards = mockData.getCreditCards();
      const transactions = mockData.getTransactions();

      const cardsWithUsage = cards.map((card) => {
        const cardTransactions = transactions.filter(
          (t) => t.credit_card_id === card.id && t.payment_method === 'credit_card' && t.type === 'expense'
        );
        const usedAmount = cardTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const availableAmount = Number(card.limit_total) - usedAmount;

        return {
          ...card,
          used_amount: usedAmount,
          available_amount: availableAmount,
          current_invoice: usedAmount,
        } as CreditCard;
      });

      setCreditCards(cardsWithUsage);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = mockData.deleteCreditCard(id);

      if (!success) {
        throw new Error('Falha ao excluir o cartão');
      }

      

      toast({
        title: "Cartão excluído",
        description: "O cartão foi excluído com sucesso.",
      });

      fetchCreditCards();
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive",
      });
    } finally {
      setDeletingCardId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Carregando cartões...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Gerenciar Cartões de Crédito
              </CardTitle>
              <CardDescription>
                Controle seus cartões e limites
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Cards Grid */}
      {creditCards.length === 0 ? (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
            >
              Cadastrar primeiro cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {creditCards.map((card) => {
            const usagePercentage = getUsagePercentage(card.used_amount, card.limit_total);
            const usageColor = getUsageColor(usagePercentage);

            return (
              <Card key={card.id} className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCard(card);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCardId(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Limite */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Limite utilizado</span>
                      <span className={usageColor}>
                        {usagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={usagePercentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(card.used_amount)}</span>
                      <span>{formatCurrency(card.limit_total)}</span>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Disponível</span>
                      <span className="font-medium text-success">
                        {formatCurrency(card.available_amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fatura atual</span>
                      <span className="font-medium">
                        {formatCurrency(card.current_invoice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Fecha: {card.closing_day}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="w-3 h-3" />
                        Vence: {card.due_day}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-end">
                      {usagePercentage >= 90 ? (
                        <Badge variant="destructive">Limite alto</Badge>
                      ) : usagePercentage >= 70 ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                          Atenção
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success">
                          Normal
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Credit Card Dialog */}
      <CreditCardDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCard(null);
        }}
        onSuccess={() => {
          fetchCreditCards();
          setEditingCard(null);
        }}
        editCard={editingCard}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingCardId} onOpenChange={(open) => !open && setDeletingCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cartão? Todas as transações associadas permanecerão, mas sem vínculo com o cartão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingCardId && handleDelete(deletingCardId)}
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