#!/bin/bash
set -e

echo "🔄 Resetando Prisma e banco de dados..."
echo ""

cd ~/a-pay/backend

# 1. Resetar migrations e banco
echo "📦 Apagando pasta de migrations..."
rm -rf prisma/migrations

# 2. Fazer push do schema atual para o banco (força sync)
echo "🚀 Aplicando schema atual ao banco de dados..."
npx prisma db push --force-reset --accept-data-loss

# 3. Criar nova migration inicial
echo "📝 Criando migration inicial..."
npx prisma migrate dev --name init --create-only

# 4. Marcar como aplicada (já fizemos push)
echo "✅ Marcando migration como aplicada..."
npx prisma migrate resolve --applied init

# 5. Regenerar Prisma Client
echo "🔧 Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ Prisma resetado com sucesso!"
echo "🔄 Reinicie o backend para aplicar as mudanças"
