# A-Pay - Sistema de Gestão para Estabelecimentos

Sistema completo de gestão multi-estabelecimento para controle de comandas, cozinha, produtos e funcionários. Ideal para food trucks, bares, restaurantes e pracinhas.

## 📋 Status do Projeto

### ✅ Funcionalidades Implementadas

#### 🔐 Autenticação e Autorização
- [x] Sistema JWT completo com access e refresh tokens
- [x] Autenticação por email e senha com bcrypt
- [x] Controle de acesso baseado em papéis (RBAC)
- [x] Permissões granulares por módulo (pedidos, cozinha, relatórios)
- [x] Suporte a múltiplos estabelecimentos por usuário
- [x] Sistema de subdomínios (admin.*, app.*)

#### 👥 Gestão de Estabelecimentos
- [x] Painel administrativo global (admin.localhost)
- [x] Criação e gerenciamento de estabelecimentos
- [x] Configuração de módulos por estabelecimento
- [x] Isolamento completo de dados (Row Level Security)

#### 👨‍💼 Gestão de Funcionários
- [x] Cadastro de funcionários por estabelecimento
- [x] Definição de papéis (Owner, User)
- [x] Permissões granulares por módulo
- [x] Ativação/desativação de funcionários
- [x] Exclusão segura (não permite remover owners)

#### 🍽️ Gestão de Produtos
- [x] Cadastro de produtos por estabelecimento
- [x] Controle de preços
- [x] Ativação/desativação de produtos
- [x] Busca e filtros
- [x] Interface responsiva

#### 📝 Sistema de Comandas
- [x] Criação de pedidos com múltiplos itens
- [x] Controle de status (pendente, em preparo, pronto, entregue)
- [x] Cálculo automático de totais
- [x] Histórico completo de pedidos
- [x] Filtros e busca

#### 🍳 Módulo de Cozinha
- [x] Quadro Kanban para visualização de pedidos
- [x] Atualização de status em tempo real
- [x] Organização por etapas do preparo
- [x] Interface otimizada para tablets

#### 📊 Relatórios
- [x] Dashboard com métricas
- [x] Filtros por período
- [x] Visualização de vendas
- [x] Exportação de dados

#### 🔄 Recursos Técnicos
- [x] PWA - Funciona offline
- [x] Server-Sent Events (SSE) para atualizações em tempo real
- [x] Retry Queue para operações offline
- [x] Documentação Swagger/OpenAPI
- [x] Validação robusta com Zod
- [x] TypeScript em todo o stack
- [x] Migrations Prisma

### 🎯 Papéis e Permissões

#### Admin Global
- Acesso total ao sistema
- Gerenciamento de estabelecimentos
- Painel administrativo exclusivo

#### Owner (Proprietário)
- Gestão completa do estabelecimento
- Cadastro de funcionários e produtos
- Acesso a todos os módulos
- Visualização de relatórios

#### User (Funcionário)
- Permissões configuráveis por módulo:
  - **Pedidos**: Criar e gerenciar comandas
  - **Cozinha**: Visualizar e atualizar status
  - **Relatórios**: Visualizar métricas

## 🚀 Stack Tecnológica

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+ com Row Level Security
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI
- **Linguagem**: TypeScript

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **Estilização**: Tailwind CSS 3.x
- **Estado**: Zustand
- **Roteamento**: React Router v6
- **PWA**: Vite PWA Plugin
- **Linguagem**: TypeScript

## 📁 Estrutura do Projeto

```
a-pay/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Schema do banco de dados
│   │   ├── migrations/             # Migrações do banco
│   │   └── seed.ts                 # Dados iniciais
│   └── src/
│       ├── modules/
│       │   ├── admin/              # Painel administrativo
│       │   ├── auth/               # Autenticação JWT
│       │   ├── employees/          # Gestão de funcionários
│       │   ├── orders/             # Sistema de comandas
│       │   └── products/           # Gestão de produtos
│       ├── shared/
│       │   ├── middleware/         # Auth, validation, etc
│       │   ├── utils/              # Helpers (JWT, password, etc)
│       │   └── types/              # Tipos TypeScript
│       └── server.ts               # Configuração do servidor
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/             # Componentes reutilizáveis
│       │   └── kitchen/            # Componentes da cozinha
│       ├── pages/
│       │   ├── AdminPage.tsx       # Painel admin
│       │   ├── EmployeesPage.tsx   # Gestão de funcionários
│       │   ├── ProductsPage.tsx    # Gestão de produtos
│       │   ├── OrdersListPage.tsx  # Lista de pedidos
│       │   ├── KitchenPage.tsx     # Quadro da cozinha
│       │   └── ReportsPage.tsx     # Relatórios
│       ├── stores/                 # Zustand stores
│       ├── services/               # API client
│       └── utils/                  # Helpers (subdomain, etc)
└── docs/                           # Documentação adicional
```

## 🛠️ Setup e Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- pnpm (recomendado) ou npm

### 1. Clone o Repositório

```bash
git clone https://github.com/tallesnicacio/a-pay.git
cd a-pay
```

### 2. Configure o Banco de Dados

```bash
# Via Docker (recomendado)
docker-compose up -d postgres

# Ou instale PostgreSQL localmente
```

### 3. Configure as Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/apay"
JWT_SECRET="seu-secret-muito-seguro-aqui"
JWT_REFRESH_SECRET="seu-refresh-secret-muito-seguro-aqui"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Instale as Dependências

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 5. Execute as Migrações e Seed

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma db seed
```

### 6. Inicie os Servidores

```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### 7. Acesse o Sistema

#### Painel Administrativo
- URL: http://admin.localhost:5173
- Login: admin@apay.com / Admin123!

#### Painel do Estabelecimento
- URL: http://app.localhost:5173
- Login: Use as credenciais dos estabelecimentos criados no seed

**Nota**: Configure o arquivo `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 admin.localhost
127.0.0.1 app.localhost
```

## 📚 Guias de Uso

### Como Criar um Novo Estabelecimento

1. Acesse o painel administrativo (admin.localhost)
2. Faça login como admin global
3. Clique em "Novo Estabelecimento"
4. Preencha os dados e configure os módulos
5. Salve e anote as credenciais de acesso

### Como Gerenciar Funcionários

1. Acesse o painel do estabelecimento (app.localhost)
2. Faça login como Owner
3. Navegue até "Funcionários"
4. Clique em "Novo Funcionário"
5. Configure as permissões desejadas
6. Salve e compartilhe as credenciais

### Como Criar Produtos

1. Acesse "Produtos" no menu
2. Clique em "Novo Produto"
3. Preencha nome e preço
4. Salve e o produto estará disponível para pedidos

### Como Fazer um Pedido

1. Acesse "Comandas"
2. Clique em "Novo Pedido"
3. Adicione produtos
4. Finalize o pedido
5. Se o módulo de cozinha estiver ativo, o pedido aparecerá automaticamente lá

## 🔒 Segurança

### Implementado

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ JWT com tokens de curta duração (15min)
- ✅ Refresh tokens seguros (7 dias)
- ✅ Row Level Security no PostgreSQL
- ✅ Validação de entrada com Zod
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ CORS configurado
- ✅ Rate limiting básico

### Recomendações para Produção

- [ ] Implementar rate limiting avançado
- [ ] Adicionar HTTPS obrigatório
- [ ] Configurar Content Security Policy (CSP)
- [ ] Implementar 2FA para admins
- [ ] Adicionar logs de auditoria
- [ ] Configurar backup automático do banco

## 🧪 Testes

```bash
# Backend - Testes unitários
cd backend
pnpm test

# Frontend - Testes com Vitest
cd frontend
pnpm test

# Coverage
pnpm test:coverage
```

## 📦 Deploy

### Backend (Railway/Render)

1. Configure as variáveis de ambiente
2. Execute as migrations
3. Deploy

```bash
# Via Railway CLI
railway up

# Via Render
# Conecte o repositório GitHub
```

### Frontend (Vercel/Netlify)

1. Configure VITE_API_URL
2. Build e deploy

```bash
# Via Vercel CLI
vercel --prod

# Via Netlify CLI
netlify deploy --prod
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Adicionar nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

### Backend
```bash
pnpm dev              # Desenvolvimento com hot reload
pnpm build            # Build para produção
pnpm start            # Executar em produção
pnpm prisma:studio    # Interface visual do banco
pnpm prisma:migrate   # Executar migrations
pnpm test             # Executar testes
```

### Frontend
```bash
pnpm dev              # Servidor de desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build
pnpm test             # Executar testes
```

## 📖 Documentação Adicional

- [Swagger/OpenAPI](http://localhost:3000/docs) - Documentação interativa da API
- [Guia de Testes](./TESTING-AUTH.md) - Como testar o sistema
- [Arquitetura](./docs/architecture.md) - Detalhes técnicos da arquitetura
- [Changelog](./CHANGELOG.md) - Histórico de versões

## 🐛 Problemas Conhecidos

- Nenhum problema crítico no momento

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Talles Nicacio**
- GitHub: [@tallesnicacio](https://github.com/tallesnicacio)

## 🙏 Agradecimentos

- Comunidade React
- Time do Fastify
- Contribuidores do Prisma
- E todos que contribuíram com feedback e sugestões

---

**Nota**: Este projeto está em desenvolvimento ativo. Novas features são adicionadas regularmente.
