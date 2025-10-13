# 🚀 Guia de Deploy - A-Pay

Este documento contém instruções completas para fazer deploy do A-Pay em produção, incluindo testes, CI/CD e monitoring.

---

## 📋 Índice

1. [Deploy Local (Docker)](#deploy-local-docker)
2. [Testes](#testes)
3. [CI/CD com GitHub Actions](#cicd-com-github-actions)
4. [Deploy Backend (Railway)](#deploy-backend-railway)
5. [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
6. [Monitoring com Sentry](#monitoring-com-sentry)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Deploy Local (Docker)

### Pré-requisitos
- Docker & Docker Compose
- Node.js 20+
- pnpm

### Setup Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/tallesnicacio/a-pay.git
cd a-pay

# 2. Execute o script de setup
chmod +x setup.sh
./setup.sh

# 3. Inicie os servidores de desenvolvimento
pnpm dev
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: `pnpm prisma:studio`

---

## Deploy em Produção

### Opção 1: Railway (Backend)

Railway é recomendado para o backend pela facilidade de setup com PostgreSQL incluído.

#### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login e deploy

```bash
cd backend
railway login
railway init
railway add postgresql
railway up
```

#### 3. Configurar variáveis de ambiente

No dashboard do Railway, adicione:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=[auto-preenchido pelo Railway]
JWT_SECRET=[gere uma senha forte]
SUPABASE_URL=[seu projeto Supabase]
SUPABASE_ANON_KEY=[chave pública]
SUPABASE_SERVICE_ROLE_KEY=[chave privada]
CORS_ORIGIN=[URL do seu frontend]
TZ=America/Sao_Paulo
```

#### 4. Rodar migrations

```bash
railway run pnpm prisma:migrate:prod
railway run pnpm prisma:seed
```

---

### Opção 2: Render (Backend)

#### 1. Criar conta no Render

Acesse [render.com](https://render.com) e crie uma conta.

#### 2. Criar PostgreSQL Database

- Dashboard → New → PostgreSQL
- Nome: `apay-db`
- Região: `Oregon (US West)`
- Copie a `Internal Database URL`

#### 3. Criar Web Service

- Dashboard → New → Web Service
- Conecte seu repositório GitHub
- Configurações:
  - **Root Directory**: `backend`
  - **Build Command**: `pnpm install && pnpm prisma:generate && pnpm build`
  - **Start Command**: `pnpm start`
  - **Environment**: `Node`

#### 4. Variáveis de ambiente

Adicione no Render:

```env
NODE_ENV=production
DATABASE_URL=[Internal Database URL do Render]
JWT_SECRET=[senha forte]
SUPABASE_URL=[projeto Supabase]
SUPABASE_ANON_KEY=[chave]
SUPABASE_SERVICE_ROLE_KEY=[chave]
CORS_ORIGIN=[URL frontend]
TZ=America/Sao_Paulo
```

#### 5. Deploy hook para migrations

Adicione um **Build Command**:

```bash
pnpm install && pnpm prisma:generate && pnpm prisma:migrate:prod && pnpm build
```

---

### Frontend: Vercel

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd frontend
vercel login
vercel
```

#### 3. Configurar variáveis de ambiente

No dashboard da Vercel:

```env
VITE_API_URL=[URL do backend no Railway/Render]
VITE_SUPABASE_URL=[projeto Supabase]
VITE_SUPABASE_ANON_KEY=[chave pública]
```

#### 4. Redeployar

```bash
vercel --prod
```

---

### Opção alternativa: Netlify (Frontend)

```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Adicione as mesmas variáveis de ambiente no dashboard da Netlify.

---

## Configuração Supabase (Auth)

### 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde provisioning (~2 min)

### 2. Configurar Email Auth

- Dashboard → Authentication → Providers
- Habilite **Email** provider
- Configure **Magic Link**:
  - ✅ Enable Email Confirmations
  - ✅ Enable Magic Link

### 3. Configurar Email Templates

- Dashboard → Authentication → Email Templates
- Customize o template de Magic Link:

```html
<h2>Seu link de acesso ao A-Pay</h2>
<p>Clique no link abaixo para fazer login:</p>
<p><a href="{{ .ConfirmationURL }}">Entrar no A-Pay</a></p>
<p>Este link expira em 1 hora.</p>
```

### 4. Adicionar Site URL

- Dashboard → Authentication → URL Configuration
- Site URL: `https://seu-frontend.vercel.app`
- Redirect URLs: `https://seu-frontend.vercel.app/**`

### 5. Copiar credenciais

- Dashboard → Settings → API
- Copie:
  - Project URL
  - anon/public key
  - service_role key (⚠️ NUNCA exponha no frontend!)

---

## Checklist Pré-Produção

Antes de ir para produção, verifique:

- [ ] Todas variáveis de ambiente configuradas
- [ ] JWT_SECRET é uma senha forte (mínimo 32 caracteres)
- [ ] CORS_ORIGIN aponta para o domínio correto
- [ ] Database migrations rodadas com sucesso
- [ ] Seed executado (ou dados iniciais criados manualmente)
- [ ] Supabase Auth configurado e testado
- [ ] Health check funcionando: `curl https://api.seudominio.com/health`
- [ ] Frontend consegue se comunicar com backend
- [ ] PWA instalável no celular
- [ ] SSL/HTTPS habilitado (automático no Vercel/Railway/Render)
- [ ] Monitoring configurado (Sentry, etc)

---

## Monitoramento

### Sentry (recomendado)

#### Backend

```bash
cd backend
pnpm add @sentry/node
```

Em `server.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Frontend

```bash
cd frontend
pnpm add @sentry/react
```

Em `main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

## Backup Database

### Automático (Railway)

Railway faz backup automático diário. Para restaurar:

```bash
railway db backup list
railway db backup restore [backup-id]
```

### Manual (qualquer Postgres)

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### Backend não conecta ao banco

1. Verifique `DATABASE_URL` está correta
2. Rode `pnpm prisma:generate` no deploy
3. Verifique logs: `railway logs` ou no dashboard Render

### Frontend não conecta ao backend

1. Verifique `VITE_API_URL` está correto
2. Verifique CORS no backend
3. Abra DevTools → Network e veja erros

### Auth não funciona

1. Verifique configurações Supabase
2. Confirme Site URL e Redirect URLs
3. Teste Magic Link no console Supabase

---

## Custos Estimados (USD/mês)

| Serviço | Tier | Custo |
|---------|------|-------|
| Railway (Backend + Postgres) | Hobby | $5 |
| Vercel (Frontend) | Hobby | $0 |
| Supabase (Auth) | Free | $0 |
| **Total** | | **$5/mês** |

Para escala maior:
- Railway Pro: $20/mês (2GB RAM, 4GB Postgres)
- Supabase Pro: $25/mês (8GB database, 100K users)

---

## Domínio Customizado

### Frontend (Vercel)

1. Dashboard → Settings → Domains
2. Add domain: `apay.seudominio.com`
3. Configure DNS (CNAME ou A record)

### Backend (Railway)

1. Dashboard → Settings → Domains
2. Generate Domain ou Custom Domain
3. Configure DNS

---

## CI/CD Automático

O deploy automático está configurado:

- **Push para `main`**: Deploy em produção
- **Pull Request**: Deploy de preview
- **Tag**: Release versioned

Para desabilitar auto-deploy, configure nas settings do Railway/Vercel.

---

## Suporte

Problemas? Abra uma issue no GitHub:
https://github.com/tallesnicacio/a-pay/issues
