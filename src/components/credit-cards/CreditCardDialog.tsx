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
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockData } from "@/store/mockData";
import { parseCurrency } from "@/utils/currency";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  limit_total: z.string().min(1, "Limite é obrigatório"),
  closing_day: z.string().min(1, "Dia de fechamento é obrigatório"),
  due_day: z.string().min(1, "Dia de vencimento é obrigatório"),
});

interface CreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editCard?: any;
}

export const CreditCardDialog = ({ open, onOpenChange, onSuccess, editCard }: CreditCardDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      limit_total: "",
      closing_day: "",
      due_day: "",
    },
  });

  useEffect(() => {
    if (editCard) {
      form.reset({
        name: editCard.name,
        limit_total: editCard.limit_total.toString(),
        closing_day: editCard.closing_day?.toString() || '',
        due_day: editCard.due_day?.toString() || ''
      });
    } else {
      form.reset({
        name: "",
        limit_total: "",
        closing_day: "",
        due_day: "",
      });
    }
  }, [editCard, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      if (editCard) {
        const updated = mockData.updateCreditCard(editCard.id, {
          name: values.name,
          limit_total: parseCurrency(values.limit_total),
          closing_day: parseInt(values.closing_day),
          due_day: parseInt(values.due_day),
        });

        if (!updated) {
          throw new Error('Não foi possível atualizar o cartão.');
        }


        toast({
          title: "Cartão atualizado!",
          description: "Cartão de crédito atualizado com sucesso.",
        });
      } else {
        const created = mockData.addCreditCard({
          name: values.name,
          limit_total: parseCurrency(values.limit_total),
          closing_day: parseInt(values.closing_day),
          due_day: parseInt(values.due_day),
        });

        if (!created) {
          throw new Error('Não foi possível cadastrar o cartão.');
        }

        toast({
          title: "Cartão cadastrado!",
          description: "Cartão de crédito cadastrado com sucesso.",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao processar cartão:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editCard ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}</DialogTitle>
          <DialogDescription>
            {editCard ? 'Edite os dados do cartão de crédito.' : 'Cadastre um novo cartão de crédito para controlar seus gastos.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank, Itaú..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="limit_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite Total</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Fechamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15"
                        min="1"
                        max="31"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10"
                        min="1"
                        max="31"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {loading ? "Salvando..." : (editCard ? "Atualizar" : "Salvar Cartão")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};