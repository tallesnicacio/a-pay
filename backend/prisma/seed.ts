import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Senha padrão para todos os usuários de teste
  const defaultPassword = await hashPassword('senha123');

  // 1. Criar Admin Global (proprietário da aplicação)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apay.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@apay.com',
      password: defaultPassword,
      name: 'Admin Global',
    },
  });

  // Create admin_global role
  const existingAdminRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      establishmentId: null,
    },
  });

  if (!existingAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        establishmentId: null,
        role: 'admin_global',
      },
    });
  }

  console.log('✅ Admin Global created: admin@apay.com (senha: senha123)');

  // 2. Criar Estabelecimento: Churrasquinho da Praça
  const churrasquinho = await prisma.establishment.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Churrasquinho da Praça',
      slug: 'churrasquinho-da-praca',
      accessCode: '1234',
      hasKitchen: true,
      hasOrders: true,
    },
  });

  // Produtos do Churrasquinho
  const churrasquinhoProducts = [
    { name: 'Espetinho de Carne', price: 8.0 },
    { name: 'Espetinho de Frango', price: 7.0 },
    { name: 'Espetinho de Queijo', price: 6.0 },
    { name: 'Refrigerante Lata', price: 5.0 },
    { name: 'Cerveja Long Neck', price: 8.0 },
    { name: 'Água Mineral', price: 3.0 },
  ];

  for (const product of churrasquinhoProducts) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        establishmentId: churrasquinho.id,
        name: product.name,
      },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          establishmentId: churrasquinho.id,
          name: product.name,
          price: product.price,
        },
      });
    }
  }

  console.log(
    `✅ Establishment created: ${churrasquinho.name} (${churrasquinhoProducts.length} products)`
  );

  // 3. Criar Owner do Churrasquinho
  const ownerChurras = await prisma.user.upsert({
    where: { email: 'owner@churrasquinho.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'owner@churrasquinho.com',
      password: defaultPassword,
      name: 'Carlos Proprietário',
    },
  });

  const existingOwnerRole = await prisma.userRole.findFirst({
    where: {
      userId: ownerChurras.id,
      establishmentId: churrasquinho.id,
    },
  });

  if (!existingOwnerRole) {
    await prisma.userRole.create({
      data: {
        userId: ownerChurras.id,
        establishmentId: churrasquinho.id,
        role: 'owner',
      },
    });
  }

  console.log('✅ Owner created: owner@churrasquinho.com (senha: senha123)');

  // 4. Criar Funcionário (user) com acesso a comandas e cozinha
  const funcionario1 = await prisma.user.upsert({
    where: { email: 'joao@churrasquinho.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'joao@churrasquinho.com',
      password: defaultPassword,
      name: 'João Silva',
    },
  });

  const existingFunc1Role = await prisma.userRole.findFirst({
    where: {
      userId: funcionario1.id,
      establishmentId: churrasquinho.id,
    },
  });

  if (!existingFunc1Role) {
    await prisma.userRole.create({
      data: {
        userId: funcionario1.id,
        establishmentId: churrasquinho.id,
        role: 'user',
        permissions: {
          modules: {
            orders: true,
            kitchen: true,
            reports: false,
          },
        },
      },
    });
  }

  console.log('✅ User created: joao@churrasquinho.com (comandas + cozinha)');

  // 5. Criar Funcionário (user) apenas com acesso a comandas
  const funcionario2 = await prisma.user.upsert({
    where: { email: 'maria@churrasquinho.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'maria@churrasquinho.com',
      password: defaultPassword,
      name: 'Maria Santos',
    },
  });

  const existingFunc2Role = await prisma.userRole.findFirst({
    where: {
      userId: funcionario2.id,
      establishmentId: churrasquinho.id,
    },
  });

  if (!existingFunc2Role) {
    await prisma.userRole.create({
      data: {
        userId: funcionario2.id,
        establishmentId: churrasquinho.id,
        role: 'user',
        permissions: {
          modules: {
            orders: true,
            kitchen: false,
            reports: false,
          },
        },
      },
    });
  }

  console.log('✅ User created: maria@churrasquinho.com (apenas comandas)');

  // 6. Criar Funcionário (user) apenas com acesso a cozinha
  const funcionario3 = await prisma.user.upsert({
    where: { email: 'pedro@churrasquinho.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'pedro@churrasquinho.com',
      password: defaultPassword,
      name: 'Pedro Cozinheiro',
    },
  });

  const existingFunc3Role = await prisma.userRole.findFirst({
    where: {
      userId: funcionario3.id,
      establishmentId: churrasquinho.id,
    },
  });

  if (!existingFunc3Role) {
    await prisma.userRole.create({
      data: {
        userId: funcionario3.id,
        establishmentId: churrasquinho.id,
        role: 'user',
        permissions: {
          modules: {
            orders: false,
            kitchen: true,
            reports: false,
          },
        },
      },
    });
  }

  console.log('✅ User created: pedro@churrasquinho.com (apenas cozinha)');

  // 7. Criar Estabelecimento: ChoppTruck Ipanema
  const choppTruck = await prisma.establishment.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'ChoppTruck Ipanema',
      slug: 'chopptruck-ipanema',
      accessCode: '5678',
      hasKitchen: false,
      hasOrders: true,
    },
  });

  // Produtos do ChoppTruck
  const choppTruckProducts = [
    { name: 'Chopp 300ml', price: 10.0 },
    { name: 'Chopp 500ml', price: 15.0 },
    { name: 'Chopp 1L', price: 25.0 },
    { name: 'Porção Amendoim', price: 8.0 },
  ];

  for (const product of choppTruckProducts) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        establishmentId: choppTruck.id,
        name: product.name,
      },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          establishmentId: choppTruck.id,
          name: product.name,
          price: product.price,
        },
      });
    }
  }

  console.log(
    `✅ Establishment created: ${choppTruck.name} (${choppTruckProducts.length} products)`
  );

  // 8. Criar Owner do ChoppTruck
  const ownerChopp = await prisma.user.upsert({
    where: { email: 'owner@chopptruck.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'owner@chopptruck.com',
      password: defaultPassword,
      name: 'Ana Proprietária',
    },
  });

  const existingOwnerChoppRole = await prisma.userRole.findFirst({
    where: {
      userId: ownerChopp.id,
      establishmentId: choppTruck.id,
    },
  });

  if (!existingOwnerChoppRole) {
    await prisma.userRole.create({
      data: {
        userId: ownerChopp.id,
        establishmentId: choppTruck.id,
        role: 'owner',
      },
    });
  }

  console.log('✅ Owner created: owner@chopptruck.com (senha: senha123)');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Credentials (senha padrão: senha123):');
  console.log('\n🔐 Admin Global:');
  console.log('  - Email: admin@apay.com');
  console.log('\n🏪 Churrasquinho da Praça:');
  console.log('  - Owner: owner@churrasquinho.com');
  console.log('  - Funcionário (comandas + cozinha): joao@churrasquinho.com');
  console.log('  - Funcionário (apenas comandas): maria@churrasquinho.com');
  console.log('  - Funcionário (apenas cozinha): pedro@churrasquinho.com');
  console.log('\n🍺 ChoppTruck Ipanema:');
  console.log('  - Owner: owner@chopptruck.com');
  console.log('\n🔑 Establishment IDs:');
  console.log(`  - Churrasquinho: ${churrasquinho.id}`);
  console.log(`  - ChoppTruck: ${choppTruck.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
