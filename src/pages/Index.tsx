import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, CreditCard, Calendar, Plus, Tags } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { MonthlyReport } from "@/components/reports/MonthlyReport";
import { CreditCardManager } from "@/components/credit-cards/CreditCardManager";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";

const Index = () => {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  KFinance
                </h1>
                <p className="text-sm text-muted-foreground">Controle Financeiro Pessoal</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsTransactionDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lançamento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Lançamentos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Cartões
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats />
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Lançamentos Recentes
                </CardTitle>
                <CardDescription>
                  Últimas movimentações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsList limit={5} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Todos os Lançamentos
                </CardTitle>
                <CardDescription>
                  Gerencie todas suas entradas e saídas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <MonthlyReport />
          </TabsContent>

          <TabsContent value="cards">
            <CreditCardManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Transaction Dialog */}
      <TransactionDialog 
        open={isTransactionDialogOpen} 
        onOpenChange={setIsTransactionDialogOpen}
        onSuccess={() => {
          setIsTransactionDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Index;
