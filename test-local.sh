#!/bin/bash

echo "🚀 A-Pay - Script de Teste Local"
echo "================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
  echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
  echo "Execute este script na raiz do projeto a-pay"
  exit 1
fi

echo -e "${GREEN}✅ Diretório correto detectado${NC}"
echo ""

# Passo 1: Verificar Docker
echo "📦 Passo 1: Verificando Docker..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"

  # Iniciar containers
  echo "🐳 Iniciando containers (Postgres + Redis)..."
  docker-compose up -d

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers iniciados com sucesso${NC}"
    echo "   - Postgres: localhost:5432"
    echo "   - Redis: localhost:6379"
  else
    echo -e "${RED}❌ Erro ao iniciar containers${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Docker não encontrado${NC}"
  echo "   Por favor, instale Docker Desktop:"
  echo "   https://www.docker.com/products/docker-desktop/"
  echo ""
  echo "   Ou execute Postgres e Redis manualmente:"
  echo "   - Postgres 15 na porta 5432"
  echo "   - Redis 7 na porta 6379"
  echo ""
  read -p "Pressione ENTER quando tiver Postgres e Redis rodando..."
fi

echo ""

# Passo 2: Backend
echo "🔧 Passo 2: Configurando Backend..."
cd backend

if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependências do backend..."
  pnpm install
fi

if [ ! -f ".env" ]; then
  echo "📝 Criando arquivo .env do backend..."
  cat > .env << EOF
DATABASE_URL="postgresql://apay:apay_dev_password@localhost:5432/apay_dev"
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
EOF
  echo -e "${GREEN}✅ Arquivo .env criado${NC}"
fi

echo "🗄️  Executando migrations..."
pnpm prisma:migrate

echo "🌱 Executando seed..."
pnpm prisma:seed

echo -e "${GREEN}✅ Backend configurado${NC}"
cd ..

echo ""

# Passo 3: Frontend
echo "🎨 Passo 3: Configurando Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependências do frontend..."
  pnpm install
fi

if [ ! -f ".env" ]; then
  echo "📝 Criando arquivo .env do frontend..."
  cat > .env << EOF
VITE_API_URL=http://localhost:3000
EOF
  echo -e "${GREEN}✅ Arquivo .env criado${NC}"
fi

echo -e "${GREEN}✅ Frontend configurado${NC}"
cd ..

echo ""
echo "================================="
echo -e "${GREEN}✅ Setup completo!${NC}"
echo "================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Iniciar o BACKEND (terminal 1):"
echo "   cd backend"
echo "   pnpm dev"
echo ""
echo "2️⃣  Iniciar o FRONTEND (terminal 2):"
echo "   cd frontend"
echo "   pnpm dev"
echo ""
echo "3️⃣  Acessar o sistema:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔌 Backend:  http://localhost:3000"
echo "   📊 Prisma Studio: cd backend && pnpm prisma:studio"
echo ""
echo "👤 USUÁRIOS DE TESTE:"
echo "   📧 Admin:    admin@apay.com"
echo "   📧 Garçom:   garcom@churrasquinho.com"
echo "   📧 Cozinha:  cozinha@churrasquinho.com"
echo ""
echo -e "${YELLOW}💡 Dica: Abra 2 terminais para rodar backend e frontend simultaneamente${NC}"
echo ""
