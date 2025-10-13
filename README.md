# A-Pay - Sistema de Controle de Pedidos

Sistema multi-estabelecimento para controle de comandas e cozinha, focado em operações de food truck e pracinhas.

## Características

- **Multi-tenant**: Isolamento completo de dados por estabelecimento
- **Módulos ativáveis**: Comanda e Cozinha podem ser ativados/desativados por estabelecimento
- **PWA**: Funciona como app no celular, com suporte a offline
- **Real-time**: Atualizações instantâneas via Server-Sent Events
- **RBAC**: Controle de acesso por papéis (Admin Global, Dono, Garçom, Cozinha, Caixa)

## Stack Tecnológica

### Backend
- Node.js 20 LTS
- Fastify 4.x
- Prisma ORM 5.x
- PostgreSQL 15+ com Row Level Security
- TypeScript

### Frontend
- React 18.x
- Vite 5.x
- Tailwind CSS 3.x
- Zustand (state management)
- PWA (manifest + service worker)

## Estrutura do Projeto

```
a-pay/
├── backend/          # API Fastify + Prisma
│   ├── src/
│   │   ├── modules/  # Módulos por domínio
│   │   ├── shared/   # Código compartilhado
│   │   └── plugins/  # Plugins Fastify
│   └── prisma/       # Schema e migrations
├── frontend/         # React PWA
│   └── src/
└── docker/          # Docker Compose configs
```

## Setup Rápido

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- pnpm (recomendado) ou npm

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/tallesnicacio/a-pay.git
cd a-pay
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Execute as migrações:
```bash
cd backend
pnpm prisma migrate dev
pnpm prisma db seed
```

6. Inicie o desenvolvimento:
```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/docs

## Usuários Seed

Após executar `prisma db seed`:

- **Admin Global**: admin@apay.com
- **Estabelecimento 1**: Churrasquinho da Praça (com cozinha)
- **Estabelecimento 2**: ChoppTruck Ipanema (só comanda)

## Scripts Disponíveis

```bash
# Raiz
pnpm install        # Instalar todas dependências
pnpm dev           # Iniciar backend + frontend
pnpm build         # Build para produção
pnpm test          # Executar testes

# Backend
pnpm dev           # Dev com hot reload
pnpm build         # Compilar TypeScript
pnpm start         # Produção
pnpm test          # Testes unitários + integração
pnpm prisma:studio # Interface visual do banco

# Frontend
pnpm dev           # Dev server
pnpm build         # Build otimizado
pnpm preview       # Preview do build
pnpm test          # Testes com Vitest
```

## Arquitetura

### Multi-tenant com RLS

Cada query ao banco é automaticamente filtrada por `establishment_id` usando Row Level Security do PostgreSQL:

```typescript
// Middleware define o contexto
await prisma.$executeRaw`SET app.current_establishment = ${establishmentId}`;

// Todas queries respeitam RLS automaticamente
const orders = await prisma.order.findMany(); // Só retorna do establishment atual
```

### Módulos por Estabelecimento

Cada estabelecimento pode ativar/desativar módulos:
- `has_orders`: Módulo de comandas
- `has_kitchen`: Módulo de cozinha

O frontend adapta o menu automaticamente.

### Fluxo de Dados

```
Garçom cria comanda → API valida → Salva no DB →
→ Se tem cozinha: Gera ticket → SSE notifica cozinha →
→ Cozinha atualiza status → SSE notifica garçom
```

## Deploy

### Desenvolvimento Local
```bash
docker-compose up
```

### Produção

**Backend**: Railway ou Render
```bash
# Via Railway CLI
railway up
```

**Frontend**: Vercel
```bash
# Via Vercel CLI
vercel --prod
```

Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas.

## Testes

```bash
# Unitários
pnpm test

# E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT

## Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
