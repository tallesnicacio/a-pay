/**
 * Script para sincronizar usuários do Supabase Auth com a tabela users
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Carregar .env explicitamente
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🔍 Debug - Variáveis de ambiente:');
console.log('  SUPABASE_URL:', supabaseUrl);
console.log('  SERVICE_KEY (primeiros 20 chars):', supabaseServiceKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

async function syncUsers() {
  try {
    console.log('\n🔄 Iniciando sincronização de usuários...\n');

    // 1. Listar usuários do Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erro ao listar usuários do Supabase:', authError);
      process.exit(1);
    }

    console.log(`📋 Encontrados ${authUsers.users.length} usuários no Supabase Auth:`);
    authUsers.users.forEach((user) => {
      console.log(`  - ${user.email} (${user.id})`);
    });

    // 2. Listar usuários da tabela users
    const dbUsers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            establishment: true,
          },
        },
      },
    });

    console.log(`\n📊 Encontrados ${dbUsers.length} usuários na tabela users:`);
    dbUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.id})`);
      user.userRoles.forEach((role) => {
        console.log(
          `    → ${role.role} @ ${role.establishment?.name || 'Global'}`
        );
      });
    });

    // 3. Identificar usuários que precisam ser sincronizados
    const usersToSync = authUsers.users.filter(
      (authUser) => !dbUsers.find((dbUser) => dbUser.id === authUser.id)
    );

    if (usersToSync.length === 0) {
      console.log('\n✅ Todos os usuários já estão sincronizados!');
      return;
    }

    console.log(
      `\n🔧 ${usersToSync.length} usuários precisam ser sincronizados:\n`
    );

    // 4. Sincronizar cada usuário
    for (const authUser of usersToSync) {
      const email = authUser.email || 'sem-email@exemplo.com';
      const name =
        authUser.user_metadata?.name ||
        authUser.user_metadata?.full_name ||
        email.split('@')[0];

      console.log(`  Sincronizando: ${email}`);

      // Gerar um hash de senha temporário (o usuário já tem senha no Supabase Auth)
      const tempPassword = await bcrypt.hash('temp-password-' + authUser.id, 10);

      try {
        await prisma.user.create({
          data: {
            id: authUser.id,
            email,
            name,
            password: tempPassword,
            active: true,
          },
        });
        console.log(`  ✅ Usuário ${email} sincronizado com sucesso!`);
      } catch (error: any) {
        console.error(`  ❌ Erro ao sincronizar ${email}:`, error.message);
      }
    }

    console.log('\n🎉 Sincronização concluída!');

    // 5. Mostrar resumo final
    const finalUsers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            establishment: true,
          },
        },
      },
    });

    console.log(`\n📈 Resumo final:`);
    console.log(`  Total de usuários na tabela users: ${finalUsers.length}`);

    const usersWithoutRoles = finalUsers.filter((u) => u.userRoles.length === 0);
    if (usersWithoutRoles.length > 0) {
      console.log(`\n⚠️  ${usersWithoutRoles.length} usuários sem roles:`);
      usersWithoutRoles.forEach((user) => {
        console.log(`  - ${user.email} (${user.id})`);
      });
      console.log('\n💡 Use o endpoint POST /api/admin/user-roles para atribuir roles.');
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsers();
