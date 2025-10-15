import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'talles.nicacio@gmail.com';
  const password = 'Admin@123'; // Senha padrão - ALTERE após primeiro login!
  const name = 'Talles Nicacio';

  try {
    console.log('🔍 Verificando se usuário já existe...');

    // Verificar se usuário já existe
    let user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: true }
    });

    if (user) {
      console.log('✅ Usuário já existe:', user.email);
      console.log('📋 Roles atuais:', user.userRoles.map(r => r.role));

      // Verificar se já tem role admin_global
      const hasAdminRole = user.userRoles.some(r => r.role === 'admin_global');

      if (!hasAdminRole) {
        console.log('➕ Adicionando role admin_global...');
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: 'admin_global',
            establishmentId: null,
          }
        });
        console.log('✅ Role admin_global adicionada com sucesso!');
      } else {
        console.log('✅ Usuário já possui role admin_global');
      }
    } else {
      console.log('➕ Criando novo usuário...');

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          active: true,
        }
      });

      console.log('✅ Usuário criado:', user.email);

      // Criar role admin_global
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'admin_global',
          establishmentId: null,
        }
      });

      console.log('✅ Role admin_global adicionada!');
      console.log('');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', password);
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    }

    // Mostrar resultado final
    const finalUser = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: true }
    });

    console.log('');
    console.log('📊 Status final:');
    console.log('- ID:', finalUser?.id);
    console.log('- Email:', finalUser?.email);
    console.log('- Nome:', finalUser?.name);
    console.log('- Ativo:', finalUser?.active);
    console.log('- Roles:', finalUser?.userRoles.map(r => r.role).join(', '));

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
