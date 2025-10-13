# 🚀 A-Pay - Guia de Início Rápido

## Pré-requisitos

- Node.js 20+ LTS
- Docker & Docker Compose
- pnpm (recomendado) ou npm

---

## Setup em 5 Minutos

### 1. Clone e Instale Dependências

```bash
# Se ainda não clonou
cd /home/tallesnicacio/a-pay

# Instalar pnpm globalmente (se não tiver)
npm install -g pnpm

# Instalar dependências
pnpm install
cd backend && pnpm install
cd ../frontend && pnpm install
cd ..
```

### 2. Inicie o Banco de Dados

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Aguardar Postgres ficar pronto (~10 segundos)
sleep 10
```

### 3. Configure o Banco

```bash
cd backend

# Gerar Prisma Client
pnpm prisma generate

# Criar estrutura do banco (tabelas, índices)
pnpm prisma migrate dev --name init

# Popular com dados de exemplo
pnpm prisma db seed
```

**Resultado esperado:**
```
✅ Admin Global created: admin@apay.com
✅ Establishment created: Churrasquinho da Praça (6 products)
✅ Establishment created: ChoppTruck Ipanema (4 products)
✅ Sample users created for Churrasquinho
🎉 Database seeded successfully!
```

### 4. Inicie os Servidores

```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Deve aparecer:
# 🚀 A-Pay API running on http://0.0.0.0:3000
# 🔗 Health check: http://0.0.0.0:3000/health
```

```bash
# Terminal 2 - Frontend
cd frontend
pnpm dev

# Deve aparecer:
# ➜  Local:   http://localhost:5173
# ➜  Network: http://192.168.x.x:5173
```

### 5. Acesse a Aplicação

**Frontend**: http://localhost:5173
**Backend API**: http://localhost:3000
**Health Check**: http://localhost:3000/health

---

## 🧪 Teste Rápido

### Fluxo Completo: Criar e Pagar Comanda

1. **Login**
   - Acesse http://localhost:5173
   - Clique em "Garçom" (ou digite `garcom@churrasquinho.com`)
   - Clique em "Entrar"
   - ✅ Deve redirecionar para `/orders`

2. **Criar Nova Comanda**
   - Clique em "+ Nova Comanda"
   - Digite código: "Mesa 5"
   - Clique em produtos:
     - 2x Espetinho de Carne (R$ 8,00 cada)
     - 1x Refrigerante Lata (R$ 5,00)
   - Veja o total: **R$ 21,00**
   - Clique em "Criar Comanda" (sem pagar agora)
   - ✅ Toast: "Comanda criada com sucesso!"
   - ✅ Deve aparecer na aba "Não Pagos" com badge vermelho

3. **Marcar como Pago**
   - Clique na comanda "Mesa 5"
   - Clique em "Marcar como Pago"
   - Selecione "PIX"
   - Clique em "Confirmar Pagamento"
   - ✅ Toast: "Pagamento registrado com sucesso!"
   - ✅ Status muda para badge verde "Pago"
   - ✅ Voltar para `/orders` e ver na aba "Pagos"

4. **Verificar Histórico**
   - Clique novamente na comanda
   - ✅ Deve mostrar "Histórico de Pagamentos"
   - ✅ PIX - R$ 21,00 - Data/hora

---

## 🔑 Credenciais de Teste

| Email | Papel | Estabelecimento |
|-------|-------|-----------------|
| `admin@apay.com` | Admin Global | Todos |
| `garcom@churrasquinho.com` | Garçom | Churrasquinho da Praça |
| `cozinha@churrasquinho.com` | Cozinha | Churrasquinho da Praça |

**Nota**: Autenticação simplificada para MVP. Apenas digite o email e entre.

---

## 📊 Dados Seed

### Churrasquinho da Praça
- 6 produtos: Espetinhos (carne, frango, queijo), bebidas
- Módulos: Comanda ✅ | Cozinha ✅

### ChoppTruck Ipanema
- 4 produtos: Chopps (300ml, 500ml, 1L), porção amendoim
- Módulos: Comanda ✅ | Cozinha ❌

---

## 🛠️ Comandos Úteis

### Backend

```bash
cd backend

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start

# Prisma Studio (interface visual do banco)
pnpm prisma studio
# Acesse: http://localhost:5555

# Ver logs do Prisma
pnpm prisma migrate status

# Resetar banco (CUIDADO: apaga tudo)
pnpm prisma migrate reset
```

### Frontend

```bash
cd frontend

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Preview do build
pnpm preview

# Lint
pnpm lint
```

### Docker

```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Limpar volumes (apaga dados do banco)
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

```bash
# Verificar se Postgres está rodando
docker-compose ps

# Ver logs do Postgres
docker-compose logs postgres

# Reiniciar Postgres
docker-compose restart postgres
```

### Erro: "Prisma Client not generated"

```bash
cd backend
pnpm prisma generate
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Ou mudar a porta no .env
# PORT=3001
```

### Erro: "CORS policy"

```bash
# Verificar CORS_ORIGIN no backend/.env
# Deve ser: http://localhost:5173
```

### Frontend não conecta ao backend

```bash
# Verificar VITE_API_URL no frontend/.env
# Deve ser: http://localhost:3000

# Reiniciar frontend após mudar .env
```

---

## 📱 PWA (Progressive Web App)

### Instalar no celular

1. Abra http://localhost:5173 no Chrome/Safari mobile
2. Toque em "Adicionar à Tela Inicial"
3. Toque no ícone A-Pay na tela inicial
4. App abre em fullscreen!

### Testar offline

1. Abra DevTools → Network → Throttling → Offline
2. App ainda carrega (service worker em ação)
3. Tentar criar pedido → Deve dar erro (retry queue não implementado ainda)

---

## 🎯 Próximos Passos

### Após teste bem-sucedido:

1. ✅ **Milestone 2 completo!**
2. 🚧 **Próximo**: Milestone 3 - Módulo Cozinha
   - Kanban board
   - Drag and drop tickets
   - Status em tempo real

### Melhorias opcionais:

- Adicionar mais produtos
- Criar mais usuários
- Testar com múltiplos dispositivos simultaneamente
- Verificar responsividade em diferentes resoluções

---

## 🆘 Suporte

**Problemas?** Abra uma issue no GitHub:
https://github.com/tallesnicacio/a-pay/issues

**Documentação completa**:
- README.md (visão geral)
- MILESTONE-1-CHECKLIST.md (infraestrutura)
- MILESTONE-2-SUMMARY.md (módulo comanda)
- DEPLOY.md (produção)

---

**Happy coding! 🎉**
