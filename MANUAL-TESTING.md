# 🧪 Guia de Testes Manual - A-Pay

## Status Atual

✅ Docker: PostgreSQL e Redis rodando
✅ Backend: Dependências instaladas
✅ Backend .env: Configurado

---

## 🚀 Como Iniciar o Sistema

### Opção 1: Via Terminal WSL (Recomendado)

Abra um terminal WSL (Ubuntu) e execute:

```bash
# 1. Navegar para o projeto
cd ~/a-pay

# 2. Iniciar Backend
cd backend
npm run dev

# Em outro terminal WSL:
# 3. Iniciar Frontend
cd ~/a-pay/frontend
npm run dev
```

### Opção 2: Via PowerShell/CMD (Windows)

```powershell
# 1. Backend
cd C:\caminho\para\a-pay\backend
npm run dev

# 2. Frontend (novo terminal)
cd C:\caminho\para\a-pay\frontend
npm run dev
```

### Opção 3: Script Automático

```bash
cd ~/a-pay
./test-local.sh
```

---

## 📝 URLs de Acesso

Após iniciar os serviços:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

---

## 🧪 Testes Manuais

### 1. Teste de Health Check

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T...",
  "uptime": 123.45,
  "environment": "development",
  "database": "connected"
}
```

### 2. Teste do Swagger

Abra: http://localhost:3000/docs

Você deve ver a documentação interativa da API.

### 3. Teste de Validação de Env

Para testar se a validação de environment variables está funcionando:

```bash
cd backend
mv .env .env.backup
npm run dev
```

**Deve falhar** com mensagem clara indicando variáveis faltando.

Depois restaure:
```bash
mv .env.backup .env
```

### 4. Teste da API - Listar Produtos

```bash
# Primeiro, precisamos de um token (MVP usa userId simples)
# Vamos usar um ID de usuário do seed

curl http://localhost:3000/products \
  -H "Authorization: Bearer user-id-do-seed"
```

### 5. Teste do Frontend - Login

1. Abra http://localhost:5173
2. Você deve ver a tela de login
3. Use as credenciais do seed:
   - Email: `admin@apay.com` (ou outro do seed)

---

## 🔍 Troubleshooting

### Problema: "pnpm: command not found"

**Solução**: Usar npm em vez de pnpm

```bash
# No package.json, trocar scripts que usam pnpm por npm
npm install
npm run dev
```

### Problema: "Erro de conexão com banco"

**Verificar containers:**
```bash
docker ps | grep apay
```

**Se não estiverem rodando:**
```bash
docker-compose up -d
```

**Verificar logs:**
```bash
docker logs apay-postgres
```

### Problema: "Porta 3000 já em uso"

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: "JWT_SECRET muito curto"

Edite `backend/.env` e garanta que JWT_SECRET tenha 32+ caracteres:

```env
JWT_SECRET=apay-dev-secret-key-change-in-production-minimum-32-chars
```

### Problema: "Migrations não aplicadas"

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

---

## 📊 Checklist de Funcionalidades

### Backend

- [ ] ✅ Health check responde
- [ ] ✅ Swagger abre em /docs
- [ ] ✅ Validação de env funciona
- [ ] ✅ Conexão com Postgres OK
- [ ] ✅ Endpoints respondem (com auth)

### Frontend

- [ ] ✅ Página de login carrega
- [ ] ✅ Login funciona
- [ ] ✅ Lista de comandas carrega
- [ ] ✅ Criar nova comanda funciona
- [ ] ✅ Marcar como pago funciona
- [ ] ✅ Página de cozinha atualiza em real-time

### Integração

- [ ] ✅ Frontend consegue chamar backend
- [ ] ✅ CORS configurado corretamente
- [ ] ✅ Real-time (SSE) funciona
- [ ] ✅ Toast notifications aparecem

---

## 🎯 Fluxo de Teste Completo

### 1. Login
- Abra http://localhost:5173
- Faça login com `admin@apay.com`

### 2. Criar Comanda
- Clique em "Nova Comanda"
- Selecione produtos
- Adicione observações
- Clique em "Criar"

### 3. Ver na Cozinha
- Abra http://localhost:5173/kitchen (em outra aba/janela)
- Você deve ver o ticket aparecer **automaticamente** (SSE)

### 4. Avançar Status na Cozinha
- Clique em "Iniciar Preparo"
- Clique em "Pronto para Entrega"
- Clique em "Entregue"

### 5. Marcar como Pago
- Volte para a lista de comandas
- Clique no cartão da comanda
- Clique em "Marcar como Pago"
- Escolha método de pagamento

### 6. Ver Relatórios
- Vá para http://localhost:5173/reports
- Veja estatísticas do dia
- Teste filtros por período

---

## 🐛 Reportar Problemas

Se encontrar bugs:

1. Anote a URL onde ocorreu
2. Tire print da tela
3. Copie o erro do console (F12 → Console)
4. Anote os passos para reproduzir

---

## 💡 Dicas

- Use **F12** para abrir o DevTools e ver erros
- Use **Ctrl+Shift+R** para forçar refresh sem cache
- Use **duas janelas** para ver real-time funcionando
- Teste em **mobile** usando o DevTools (Ctrl+Shift+M)

---

## ✅ Sistema Funcionando 100%

Quando todos os testes passarem, você terá:

- ✅ Login funcional
- ✅ CRUD de comandas
- ✅ Módulo de cozinha com real-time
- ✅ Relatórios e estatísticas
- ✅ Admin para gerenciar estabelecimentos
- ✅ PWA instalável
- ✅ API documentada

**Pronto para evoluir!** 🚀
