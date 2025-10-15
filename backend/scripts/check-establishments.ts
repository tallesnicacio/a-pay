/**
 * Script para verificar as configurações dos estabelecimentos
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkEstablishments() {
  try {
    console.log('🏢 Verificando estabelecimentos...\n');

    const establishments = await prisma.establishment.findMany({
      orderBy: { name: 'asc' },
    });

    console.log(`📊 Total de estabelecimentos: ${establishments.length}\n`);

    establishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name}`);
      console.log(`   ID: ${est.id}`);
      console.log(`   Slug: ${est.slug}`);
      console.log(`   Ativo: ${est.active ? '✅' : '❌'}`);
      console.log(`   Módulos habilitados:`);
      console.log(`     - Cozinha: ${est.hasKitchen ? '✅' : '❌'}`);
      console.log(`     - Pedidos: ${est.hasOrders ? '✅' : '❌'}`);
      console.log(`     - Relatórios: ${est.hasReports ? '✅' : '❌'}`);
      console.log(`     - Cardápio Online: ${est.onlineOrdering ? '✅' : '❌'}`);
      console.log(`   Código de Acesso: ${est.accessCode || 'Não definido'}`);
      console.log(`   Criado em: ${est.createdAt.toLocaleString('pt-BR')}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Erro ao verificar estabelecimentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEstablishments();
