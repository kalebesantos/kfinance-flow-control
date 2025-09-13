import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#10b981'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Por enquanto, vamos simular categorias locais
      // Quando a autenticação estiver implementada, isso buscará do banco
      const mockCategories: Category[] = [
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
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Por enquanto, adiciona localmente
      // Quando a autenticação estiver implementada, salvará no banco
      const newCat: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color,
      };
      
      setCategories([...categories, newCat]);
      setNewCategory({ name: '', type: 'expense', color: '#10b981' });
      setShowAddForm(false);
      
      toast({
        title: "Categoria criada!",
        description: `A categoria "${newCategory.name}" foi criada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      setLoading(true);
      
      // Por enquanto, remove localmente
      // Quando a autenticação estiver implementada, deletará do banco
      setCategories(categories.filter(c => c.id !== category.id));
      setDeleteCategory(null);
      
      toast({
        title: "Categoria excluída!",
        description: `A categoria "${category.name}" foi excluída com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const predefinedColors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f97316', // orange
    '#6b7280', // gray
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Categorias</CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aviso sobre autenticação */}
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              As categorias estão sendo exibidas localmente. Implemente autenticação para salvar no banco de dados.
            </p>
          </div>

          {/* Formulário de adicionar categoria */}
          {showAddForm && (
            <Card className="p-4 border-primary/20">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Nome da Categoria</Label>
                    <Input
                      id="category-name"
                      placeholder="Ex: Assinaturas"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-type">Tipo</Label>
                    <Select
                      value={newCategory.type}
                      onValueChange={(value: 'income' | 'expense') => 
                        setNewCategory({ ...newCategory, type: value })
                      }
                    >
                      <SelectTrigger id="category-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color ? 'border-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddCategory}
                    disabled={loading}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ name: '', type: 'expense', color: '#10b981' });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de categorias por tipo */}
          <div className="space-y-6">
            {/* Categorias de Despesa */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                Categorias de Despesa
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories
                  .filter(c => c.type === 'expense')
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <button
                        onClick={() => setDeleteCategory(category)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Categorias de Receita */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Categorias de Receita
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories
                  .filter(c => c.type === 'income')
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <button
                        onClick={() => setDeleteCategory(category)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteCategory?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory && handleDeleteCategory(deleteCategory)}
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