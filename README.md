# 💰 KFinance - Sistema de Controle Financeiro Pessoal

![KFinance Logo](https://img.shields.io/badge/KFinance-Controle%20Financeiro-00D4AA?style=for-the-badge&logo=wallet&logoColor=white)

Um sistema completo de controle financeiro pessoal desenvolvido com tecnologias modernas, oferecendo uma interface intuitiva e funcionalidades avançadas para gerenciar suas finanças de forma eficiente.

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Visão Geral Financeira**: Acompanhe receitas, despesas e saldo em tempo real
- **Estatísticas Detalhadas**: Métricas importantes para análise financeira
- **Lançamentos Recentes**: Visualização rápida das últimas movimentações
- **Indicadores Visuais**: Cores e ícones para facilitar a interpretação dos dados

### 💳 Gestão de Cartões de Crédito
- **Cadastro Completo**: Nome, limite total, dia de fechamento e vencimento
- **Controle de Limites**: Acompanhamento do limite disponível
- **Integração com Transações**: Associação de gastos aos cartões específicos

### 🏷️ Sistema de Categorias
- **Categorias Personalizáveis**: Crie e gerencie suas próprias categorias
- **Cores e Ícones**: Personalização visual para melhor organização
- **Separação por Tipo**: Categorias específicas para receitas e despesas
- **Categorias Padrão**: Sistema pré-configurado com categorias comuns

### 📝 Gestão de Transações
- **Lançamentos Detalhados**: Descrição, valor, data, categoria e método de pagamento
- **Parcelamentos**: Suporte completo para transações parceladas
- **Múltiplos Métodos**: Dinheiro, cartão de crédito, débito, PIX, transferência
- **Status de Pagamento**: Controle de transações pagas e pendentes
- **Notas Adicionais**: Campo para observações importantes

### 📈 Relatórios e Análises
- **Relatórios Mensais**: Análise detalhada por período
- **Gráficos Interativos**: Visualizações com Recharts para melhor compreensão
- **Filtros Avançados**: Busca por período, categoria, tipo de transação
- **Exportação de Dados**: Possibilidade de exportar relatórios

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca principal para interface de usuário
- **TypeScript 5.5.3** - Tipagem estática para maior robustez
- **Vite 5.4.1** - Build tool moderno e rápido
- **React Router DOM 6.26.2** - Roteamento client-side
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Zod 3.23.8** - Validação de schemas

### UI/UX
- **Tailwind CSS 3.4.11** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes acessíveis
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones modernos e consistentes
- **Recharts 2.12.7** - Biblioteca de gráficos para React
- **Sonner** - Sistema de notificações toast

### Backend e Banco de Dados
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional robusto
- **Row Level Security (RLS)** - Segurança a nível de linha
- **Supabase Auth** - Sistema de autenticação integrado

### Gerenciamento de Estado
- **TanStack Query 5.56.2** - Gerenciamento de estado do servidor
- **React Hooks** - Gerenciamento de estado local

### Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos
- **Lovable Tagger** - Ferramenta de desenvolvimento

## 📁 Estrutura do Projeto

```
kfinance-flow-control/
├── public/                     # Arquivos estáticos
├── src/
│   ├── components/            # Componentes React
│   │   ├── categories/        # Gestão de categorias
│   │   ├── credit-cards/      # Gestão de cartões
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── reports/           # Relatórios e gráficos
│   │   ├── transactions/      # Gestão de transações
│   │   └── ui/               # Componentes de interface
│   ├── hooks/                # Custom hooks
│   ├── integrations/         # Integrações externas
│   │   └── supabase/         # Configuração do Supabase
│   ├── lib/                  # Utilitários e helpers
│   ├── pages/                # Páginas da aplicação
│   ├── store/                # Estado global (mock data)
│   └── utils/                # Funções utilitárias
├── supabase/                 # Configuração do Supabase
│   ├── migrations/           # Migrações do banco
│   └── config.toml          # Configuração local
└── docs/                    # Documentação
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `transactions`
- **id**: UUID único da transação
- **user_id**: ID do usuário (RLS)
- **description**: Descrição da transação
- **amount**: Valor da transação
- **type**: Tipo (income/expense)
- **categories**: Array de categorias
- **date**: Data da transação
- **credit_card_id**: ID do cartão (opcional)
- **installments**: Número de parcelas
- **current_installment**: Parcela atual
- **created_at/updated_at**: Timestamps

#### `categories`
- **id**: UUID único da categoria
- **user_id**: ID do usuário (RLS)
- **name**: Nome da categoria
- **type**: Tipo (income/expense)
- **color**: Cor da categoria
- **icon**: Ícone da categoria
- **created_at/updated_at**: Timestamps

#### `credit_cards`
- **id**: UUID único do cartão
- **user_id**: ID do usuário (RLS)
- **name**: Nome do cartão
- **limit_total**: Limite total
- **closing_day**: Dia de fechamento
- **due_day**: Dia de vencimento
- **created_at/updated_at**: Timestamps

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd kfinance-flow-control
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Configure o Supabase**
```bash
# Instale o CLI do Supabase
npm install -g supabase

# Inicie o Supabase localmente
supabase start

# Aplique as migrações
supabase db reset
```

5. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:8080`

## 📱 Responsividade

O KFinance foi desenvolvido com foco na responsividade, oferecendo uma experiência otimizada em:
- **Desktop**: Interface completa com todas as funcionalidades
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Interface mobile-first com navegação intuitiva

## 🎨 Design System

### Cores
- **Primary**: Gradiente azul-verde (#00D4AA)
- **Success**: Verde para receitas (#10b981)
- **Destructive**: Vermelho para despesas (#ef4444)
- **Warning**: Laranja para alertas (#f59e0b)

### Componentes
- **Cards**: Design moderno com gradientes e sombras
- **Botões**: Estilos consistentes com estados hover/focus
- **Formulários**: Validação em tempo real com feedback visual
- **Gráficos**: Visualizações interativas e responsivas

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário só acessa seus próprios dados
- **Autenticação Supabase**: Sistema robusto de autenticação
- **Validação de Dados**: Validação tanto no frontend quanto no backend
- **HTTPS**: Comunicação segura com o banco de dados

## 🚀 Deploy

### Deploy no Supabase
1. Conecte seu repositório ao Supabase
2. Configure as variáveis de ambiente
3. Execute as migrações
4. Faça o deploy da aplicação

### Deploy Manual
```bash
# Build da aplicação
npm run build

# Os arquivos estarão na pasta dist/
# Faça upload para seu servidor de hospedagem
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Kalebe Santos**
- GitHub: [@kalebesantos](https://github.com/kalebesantos)
- LinkedIn: [Kalebe Santos](https://linkedin.com/in/kalebesantos)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend-as-a-Service
- [shadcn/ui](https://ui.shadcn.com) - Biblioteca de componentes
- [Radix UI](https://radix-ui.com) - Componentes primitivos
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Vite](https://vitejs.dev) - Build tool

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐