# A-Pay Backend API

Backend Node.js/Express com PostgreSQL para o sistema A-Pay.

## 🚀 Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de ter o PostgreSQL instalado e rodando na VPS.

Execute as migrations do banco:

```bash
# Na pasta raiz do projeto
psql -U postgres -d a_pay -f supabase/migrations/20251011095227_db170359-71ff-4473-bc40-45d3f189a53b.sql
psql -U postgres -d a_pay -f supabase/migrations/20251114000000_add_password_to_profiles.sql
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=a_pay
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

JWT_SECRET=seu_secret_jwt_super_secreto_aqui
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:8080
```

### 4. Rodar o Servidor

**Desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/signup` - Criar nova conta
- `POST /api/auth/signin` - Login
- `GET /api/auth/profile` - Obter perfil (requer auth)
- `GET /api/auth/roles` - Obter permissões (requer auth)

### Estabelecimentos

- `GET /api/establishments` - Listar estabelecimentos do usuário
- `GET /api/establishments/:id` - Obter estabelecimento por ID

### Produtos

- `GET /api/products?establishment_id=xxx&active=true` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Excluir produto

### Pedidos

- `GET /api/orders?establishment_id=xxx&status=open` - Listar pedidos
- `GET /api/orders/:id` - Obter pedido por ID
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id` - Atualizar pedido
- `POST /api/orders/:id/cancel` - Cancelar pedido
- `POST /api/orders/:id/close` - Fechar pedido

### Cozinha

- `GET /api/kitchen/tickets?establishment_id=xxx&status=queue` - Listar tickets
- `PUT /api/kitchen/tickets/:id/status` - Atualizar status do ticket

### Pagamentos

- `POST /api/payments` - Registrar pagamento
- `GET /api/payments/order/:order_id` - Listar pagamentos do pedido

### Analytics

- `GET /api/analytics/dashboard?establishment_id=xxx&start_date=xxx&end_date=xxx` - Métricas do dashboard

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer seu_token_aqui
```

## 🗄️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (database, etc)
│   ├── controllers/     # Controllers da API
│   ├── middleware/      # Middleware (auth, etc)
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 📝 Notas

- As senhas são hasheadas com bcrypt
- Tokens JWT expiram em 7 dias por padrão
- CORS configurado para permitir requisições do frontend
- Logs de requisições com Morgan
- Helmet para segurança de headers HTTP
