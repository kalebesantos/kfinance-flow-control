import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { parseCurrency } from "@/utils/currency";
import { mockData } from "@/store/mockData";

const formSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  type: z.enum(["income", "expense"]),
  payment_method: z.enum(["cash", "credit_card", "debit_card", "pix", "transfer"]),
  status: z.enum(["paid", "pending"]),
  is_installment: z.boolean(),
  installment_count: z.string().optional(),
  credit_card_id: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CreditCard {
  id: string;
  name: string;
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editTransaction?: any;
}

export const TransactionDialog = ({ open, onOpenChange, onSuccess, editTransaction }: TransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      description: "",
      category_id: "",
      amount: "",
      type: "expense",
      payment_method: "cash",
      status: "paid",
      is_installment: false,
      installment_count: "1",
      credit_card_id: "",
      due_date: "",
      notes: "",
    },
  });

  const watchType = form.watch("type");
  const watchPaymentMethod = form.watch("payment_method");
  const watchIsInstallment = form.watch("is_installment");

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchCreditCards();
    }
  }, [open]);

  useEffect(() => {
    if (editTransaction) {
      form.reset({
        date: format(new Date(editTransaction.date), 'yyyy-MM-dd'),
        description: editTransaction.description,
        category_id: editTransaction.category_id || '',
        amount: editTransaction.amount.toString(),
        type: editTransaction.type,
        payment_method: editTransaction.payment_method,
        status: editTransaction.status || 'paid',
        is_installment: editTransaction.is_installment || false,
        installment_count: editTransaction.installment_count?.toString() || "1",
        credit_card_id: editTransaction.credit_card_id || '',
        due_date: editTransaction.due_date ? format(new Date(editTransaction.due_date), 'yyyy-MM-dd') : '',
        notes: editTransaction.notes || ''
      });
    } else {
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: "",
        category_id: "",
        amount: "",
        type: "expense",
        payment_method: "cash",
        status: "paid",
        is_installment: false,
        installment_count: "1",
        credit_card_id: "",
        due_date: "",
        notes: "",
      });
    }
  }, [editTransaction, form]);

  const fetchCategories = async () => {
    try {
      // Buscar categorias mockadas
      const allCategories = mockData.getCategories();
      const filteredCategories = watchType 
        ? allCategories.filter(c => c.type === watchType)
        : allCategories;
      
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };
  
  const fetchCreditCards = async () => {
    try {
      // Buscar cartões mockados
      const allCards = mockData.getCreditCards();
      setCreditCards(allCards);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const amount = parseCurrency(values.amount);
      const installmentCount = values.is_installment ? parseInt(values.installment_count || "1") : 1;

      if (editTransaction) {
        // Atualizar transação existente
        const updated = mockData.updateTransaction(editTransaction.id, {
          date: values.date,
          description: values.description,
          category_id: values.category_id,
          amount: amount,
          type: values.type,
          payment_method: values.payment_method,
          status: values.status,
          is_installment: values.is_installment,
          installment_count: installmentCount,
          current_installment: editTransaction.current_installment || 1,
          credit_card_id: values.payment_method === 'credit_card' ? values.credit_card_id : null,
          due_date: values.due_date || null,
          notes: values.notes || null,
        });

        if (updated) {
          toast({
            title: "Lançamento atualizado!",
            description: "Transação atualizada com sucesso.",
          });
        }
      } else if (values.is_installment && installmentCount > 1) {
        // Criar transações parceladas
        const installmentAmount = amount / installmentCount;
        const baseDate = new Date(values.date);

        for (let i = 0; i < installmentCount; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          mockData.addTransaction({
            date: format(installmentDate, 'yyyy-MM-dd'),
            description: `${values.description} (${i + 1}/${installmentCount})`,
            category_id: values.category_id,
            amount: installmentAmount,
            type: values.type,
            payment_method: values.payment_method,
            status: i === 0 ? values.status : 'pending',
            is_installment: true,
            installment_count: installmentCount,
            current_installment: i + 1,
            credit_card_id: values.payment_method === 'credit_card' ? values.credit_card_id : null,
            due_date: values.due_date || null,
            notes: values.notes || null,
          });
        }

        toast({
          title: "Lançamento cadastrado!",
          description: `${installmentCount} parcelas criadas com sucesso.`,
        });
      } else {
        // Criar transação única
        mockData.addTransaction({
          date: values.date,
          description: values.description,
          category_id: values.category_id,
          amount: amount,
          type: values.type,
          payment_method: values.payment_method,
          status: values.status,
          is_installment: false,
          installment_count: 1,
          current_installment: 1,
          credit_card_id: values.payment_method === 'credit_card' ? values.credit_card_id : null,
          due_date: values.due_date || null,
          notes: values.notes || null,
        });

        toast({
          title: "Lançamento cadastrado!",
          description: "Transação cadastrada com sucesso.",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao processar lançamento:', error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>
            {editTransaction ? 'Edite os dados da transação.' : 'Cadastre uma nova entrada ou saída financeira.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Data e Descrição */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o lançamento..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="income" id="income" />
                          <Label htmlFor="income" className="text-success">Entrada</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expense" id="expense" />
                          <Label htmlFor="expense" className="text-destructive">Saída</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Forma de Pagamento e Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['cash', 'credit_card', 'debit_card', 'pix', 'transfer'].map((method) => (
                          <SelectItem key={method} value={method}>
                            {getPaymentMethodLabel(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="pending">A pagar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cartão de Crédito (se aplicável) */}
            {watchPaymentMethod === 'credit_card' && (
              <FormField
                control={form.control}
                name="credit_card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão de Crédito</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creditCards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Parcelamento (apenas para criação) */}
            {!editTransaction && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_installment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Parcelado</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Dividir o valor em várias parcelas
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchIsInstallment && (
                  <FormField
                    control={form.control}
                    name="installment_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2"
                            max="60"
                            placeholder="Ex: 12"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Data de Vencimento */}
            {watchType === 'expense' && (
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-primary hover:opacity-90"
              >
                {loading ? "Salvando..." : (editTransaction ? "Atualizar" : "Cadastrar")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};