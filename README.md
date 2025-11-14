# A-Pay - Sistema de Gestão de Pedidos

Sistema completo de gestão de pedidos para estabelecimentos com módulos de Pedidos, Cozinha e Caixa.

## 🏗️ Arquitetura

Este projeto é dividido em duas partes:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + PostgreSQL

## 🚀 Começando

### Requisitos

- Node.js 18+ e npm
- PostgreSQL 12+
- Git

### 1. Clone o Repositório

```bash
git clone <YOUR_GIT_URL>
cd a-pay
```

### 2. Configure o Banco de Dados

#### Criar o banco de dados

```bash
createdb a_pay
```

#### Executar as migrations

```bash
psql -U postgres -d a_pay -f supabase/migrations/20251011095227_db170359-71ff-4473-bc40-45d3f189a53b.sql
psql -U postgres -d a_pay -f supabase/migrations/20251114000000_add_password_to_profiles.sql
```

### 3. Configure o Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET

# Rodar o servidor
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 4. Configure o Frontend

```bash
# Na raiz do projeto
npm install

# Configurar variáveis de ambiente
# O arquivo .env já deve ter VITE_API_URL=http://localhost:3001/api

# Rodar o frontend
npm run dev
```

O frontend estará rodando em `http://localhost:8080`

## 📁 Estrutura do Projeto

```
a-pay/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/          # Database e configurações
│   │   ├── controllers/     # Controllers da API
│   │   ├── middleware/      # Autenticação JWT
│   │   ├── routes/          # Rotas da API
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── src/                     # Frontend React
│   ├── components/          # Componentes React
│   │   ├── cashier/         # Módulo de caixa
│   │   ├── kitchen/         # Módulo de cozinha
│   │   ├── orders/          # Módulo de pedidos
│   │   ├── products/        # Gestão de produtos
│   │   ├── layout/          # Layout (Header, Sidebar)
│   │   ├── common/          # Componentes comuns
│   │   └── ui/              # Componentes shadcn/ui
│   ├── contexts/            # React Contexts (Auth, Establishment)
│   ├── lib/                 # API client HTTP
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços de API
│   ├── utils/               # Utilitários
│   └── constants/           # Constantes e enums
│
├── supabase/migrations/     # Migrations do banco de dados
├── public/                  # Assets estáticos
└── package.json             # Dependências do frontend
```

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router v6
- TanStack React Query (gerenciamento de estado)
- React Hook Form + Zod (formulários e validação)
- shadcn/ui + Tailwind CSS (UI)
- Recharts (gráficos)
- date-fns (datas)

### Backend
- Node.js + TypeScript
- Express (framework web)
- PostgreSQL (banco de dados)
- pg (PostgreSQL client)
- JWT (autenticação)
- bcryptjs (hash de senhas)
- Helmet (segurança)
- Morgan (logging)
- CORS

## 📊 Funcionalidades

### ✅ Implementado

- **Autenticação**: Login/Cadastro com JWT
- **Multi-estabelecimento**: Suporte a múltiplos estabelecimentos
- **Gestão de Produtos**: CRUD completo com status ativo/inativo
- **Módulo de Pedidos**: Criação, listagem, detalhes, cancelamento
- **Módulo de Cozinha**: Kanban (Fila → Preparando → Pronto)
- **Módulo de Caixa**: Pagamentos múltiplos, troco, fechamento automático
- **Dashboard**: Métricas e gráficos de faturamento
- **Permissões**: Sistema de roles (admin, owner, waiter, kitchen, cashier)

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Autenticação JWT stateless
- Row Level Security (RLS) no banco
- Validação de dados com Zod
- Headers HTTP seguros com Helmet
- CORS configurado

## 🌐 API Endpoints

Consulte o [README do Backend](./backend/README.md) para documentação completa da API.

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Rodar em desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

### Backend
```bash
cd backend
npm run dev      # Rodar em desenvolvimento (hot reload)
npm run build    # Compilar TypeScript
npm start        # Rodar em produção
```

## 🚀 Deploy

### Backend (VPS)

1. Clone o repositório na VPS
2. Configure o PostgreSQL
3. Execute as migrations
4. Configure o `.env` do backend
5. Build e rode o backend:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

### Frontend

1. Configure a variável `VITE_API_URL` com a URL do backend
2. Build o frontend:
   ```bash
   npm run build
   ```
3. Sirva a pasta `dist` com nginx ou outro servidor

## 📖 Documentação

- [Backend API](./backend/README.md)
- [Schema do Banco de Dados](./supabase/migrations/)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ para gestão eficiente de estabelecimentos**
