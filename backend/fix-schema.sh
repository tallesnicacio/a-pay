#!/bin/bash
set -e

echo "🔄 Aplicando mudanças do schema ao banco de dados..."
echo ""

cd ~/a-pay/backend

# Usar db push sem reset (mais seguro e rápido)
echo "🚀 Sincronizando schema com banco..."
npx prisma db push --skip-generate

# Regenerar Prisma Client
echo "🔧 Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ Schema atualizado com sucesso!"
echo "✅ Colunas 'category' e 'customer_name' adicionadas!"
echo ""
echo "🔄 O backend deve reiniciar automaticamente..."
