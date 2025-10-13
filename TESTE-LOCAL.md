# 🧪 Guia de Teste Local - A-Pay

Este guia te ajudará a testar o sistema A-Pay localmente no seu computador.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa ter instalado:

- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **pnpm** - Instale com: `npm install -g pnpm`
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
  - Ou **Postgres 15** e **Redis 7** instalados localmente

---

## 🚀 OPÇÃO 1: COM DOCKER (RECOMENDADO)

### Passo 1: Iniciar Containers

```bash
# Na raiz do projeto a-pay
docker-compose up -d
```

Isso vai iniciar:
- 🐘 PostgreSQL 15 na porta `5432`
- 🔴 Redis 7 na porta `6379`

Verifique se estão rodando:
```bash
docker ps
```

### Passo 2: Configurar Backend

```bash
cd backend

# Instalar dependências
pnpm install

# Rodar migrations
pnpm prisma:migrate

# Fazer seed do banco
pnpm prisma:seed

# Iniciar servidor
pnpm dev
```

✅ Backend estará rodando em `http://localhost:3000`

### Passo 3: Configurar Frontend (em outro terminal)

```bash
cd frontend

# Instalar dependências
pnpm install

# Iniciar servidor
pnpm dev
```

✅ Frontend estará rodando em `http://localhost:5173`

### Passo 4: Acessar o Sistema

Abra seu navegador em: **http://localhost:5173**

---

## 🔧 OPÇÃO 2: SEM DOCKER

Se não tiver Docker, você precisa instalar Postgres e Redis manualmente.

### Passo 1: Instalar Postgres 15

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Durante instalação, defina:
  - User: `apay`
  - Password: `apay_dev_password`
  - Database: `apay_dev`
  - Port: `5432`

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15

# Criar usuário e database
psql postgres
CREATE USER apay WITH PASSWORD 'apay_dev_password';
CREATE DATABASE apay_dev OWNER apay;
\q
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-15

# Configurar usuário e database
sudo -u postgres psql
CREATE USER apay WITH PASSWORD 'apay_dev_password';
CREATE DATABASE apay_dev OWNER apay;
\q
```

### Passo 2: Instalar Redis 7

**Windows:**
- Use WSL2 ou Docker
- Ou baixe Redis via Memurai: https://www.memurai.com/

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### Passo 3: Configurar Backend

```bash
cd backend

# Verificar .env (já criado automaticamente)
cat .env

# Instalar dependências
pnpm install

# Rodar migrations
pnpm prisma:migrate

# Fazer seed
pnpm prisma:seed

# Iniciar servidor
pnpm dev
```

### Passo 4: Configurar Frontend

```bash
cd frontend

# Verificar .env (já criado automaticamente)
cat .env

# Instalar dependências
pnpm install

# Iniciar servidor
pnpm dev
```

---

## 👤 USUÁRIOS DE TESTE

Após o seed, você pode fazer login com:

| Email | Senha | Estabelecimento | Role |
|-------|-------|-----------------|------|
| `admin@apay.com` | *(não tem senha no MVP)* | Admin Global | admin_global |
| `garcom@churrasquinho.com` | *(não tem senha)* | Churrasquinho da Praça | waiter |
| `cozinha@churrasquinho.com` | *(não tem senha)* | Churrasquinho da Praça | kitchen |
| `dono@chopptruck.com` | *(não tem senha)* | ChoppTruck Ipanema | owner |

> **Nota:** No MVP, o login é simplificado (apenas email). Em produção, usar Supabase Auth.

---

## 🧪 FLUXO DE TESTE COMPLETO

### 1. Testar Login e Comandas

1. Acesse http://localhost:5173
2. Login: `garcom@churrasquinho.com`
3. Clique "+ Nova Comanda"
4. Código: "Mesa 10"
5. Adicione produtos (ex: 2x Espetinho de Frango)
6. Clique "Criar Comanda"
7. ✅ Comanda deve aparecer na lista "Não Pagos"

### 2. Testar Pagamento

1. Clique na comanda criada
2. Clique "Marcar como Pago"
3. Escolha método: Dinheiro
4. Confirme
5. ✅ Comanda deve mover para "Pagos"

### 3. Testar Cozinha

1. Abra nova aba: http://localhost:5173
2. Login: `cozinha@churrasquinho.com`
3. Clique no menu "Cozinha"
4. ✅ Deve aparecer o ticket da comanda na coluna "Fila"
5. Passe o mouse sobre o ticket
6. Clique "Avançar →"
7. ✅ Ticket deve mover para "Em Preparo"
8. Continue avançando até "Entregue"

### 4. Testar Real-Time (SSE)

1. **Janela A**: Garçom (`garcom@churrasquinho.com`) - Comandas
2. **Janela B**: Cozinha (`cozinha@churrasquinho.com`) - Cozinha

**Teste:**
- Na Janela A, crie nova comanda
- ✅ Na Janela B, ticket deve aparecer **instantaneamente** na fila
- Status "Tempo real ativo" deve estar verde

### 5. Testar Relatórios

1. Login: qualquer usuário
2. Clique "Relatórios" no menu inferior
3. Tab "Diário"
   - ✅ Deve mostrar vendas de hoje
   - ✅ Top produtos
   - ✅ Distribuição por hora
4. Tab "Por Período"
   - Selecione últimos 7 dias
   - ✅ Deve mostrar gráfico de vendas
   - Clique "Exportar CSV"
   - ✅ Deve baixar arquivo

### 6. Testar Admin

1. Logout
2. Login: `admin@apay.com`
3. Acesse: http://localhost:5173/admin
4. Tab "Estabelecimentos"
   - Clique "+ Novo Estabelecimento"
   - Nome: "Lanchonete Teste"
   - Slug: "lanchonete-teste"
   - ✅ Deve criar e aparecer na lista
5. Tab "Usuários"
   - Clique "+ Novo Usuário"
   - Nome: "João Teste"
   - Email: "joao@teste.com"
   - ✅ Deve criar e aparecer na lista

### 7. Testar Offline Support

1. Abra DevTools (F12)
2. Network tab → Throttling → Offline
3. Tente criar uma comanda
4. ✅ Deve aparecer indicador "Sem conexão"
5. ✅ Toast: "Sem conexão. A operação será executada quando você voltar online."
6. Network tab → Throttling → Online
7. ✅ Indicador deve mudar para "Sincronizando"
8. ✅ Operação deve ser executada automaticamente

---

## 🔍 FERRAMENTAS ÚTEIS

### Prisma Studio (GUI do Banco)

```bash
cd backend
pnpm prisma:studio
```

Acesse: http://localhost:5555
- Ver/editar dados diretamente
- Útil para debug

### Logs do Backend

Os logs aparecem no terminal onde você rodou `pnpm dev`
- Requisições HTTP
- Queries SQL
- Erros

### DevTools do Frontend

Pressione F12 no navegador:
- **Console**: Logs do JavaScript
- **Network**: Ver requisições API
- **Application**: Ver localStorage (auth, retry queue)

---

## 🐛 TROUBLESHOOTING

### Problema: "Error: P1001: Can't reach database server"

**Solução:**
- Verifique se Postgres está rodando: `docker ps` ou `pg_isctl status`
- Verifique a porta: `lsof -i :5432`
- Verifique o DATABASE_URL no `.env`

### Problema: "Port 3000 already in use"

**Solução:**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mudar PORT no backend/.env
PORT=3001
```

### Problema: "CORS error" no frontend

**Solução:**
- Verifique CORS_ORIGIN no `backend/.env`: `http://localhost:5173`
- Reinicie o backend

### Problema: Frontend não carrega dados

**Solução:**
- Verifique VITE_API_URL no `frontend/.env`: `http://localhost:3000`
- Verifique se backend está rodando: http://localhost:3000/health
- Reinicie o frontend

### Problema: Migrations não rodam

**Solução:**
```bash
cd backend

# Resetar banco (CUIDADO: apaga todos os dados)
pnpm prisma:migrate:reset

# Ou rodar migrations manualmente
pnpm prisma:migrate:dev

# Depois fazer seed novamente
pnpm prisma:seed
```

---

## 📊 VALIDAÇÕES DE SUCESSO

Após seguir todos os passos, você deve ter:

- ✅ Backend rodando em http://localhost:3000
- ✅ Frontend rodando em http://localhost:5173
- ✅ Postgres com 2 estabelecimentos e 10 produtos
- ✅ Login funcionando com os 3 usuários de teste
- ✅ Criar comandas funcionando
- ✅ Marcar como pago funcionando
- ✅ Cozinha kanban funcionando
- ✅ Real-time (SSE) funcionando
- ✅ Relatórios mostrando dados
- ✅ Admin acessível apenas para admin@apay.com
- ✅ Offline support com retry queue

---

## 🧪 RODAR TESTES

### Testes Unitários Backend

```bash
cd backend
pnpm test
```

### Testes E2E Frontend

```bash
cd frontend
pnpm test:e2e
```

---

## 📞 AJUDA

Se encontrar problemas:
1. Verifique os logs no terminal
2. Consulte QUICKSTART.md
3. Consulte DEPLOY.md
4. Abra uma issue no GitHub

---

**Desenvolvido por:** Claude (Sonnet 4.5)
**Data:** 2025-10-12
