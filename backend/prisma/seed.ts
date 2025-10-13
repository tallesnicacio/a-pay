import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Criar Admin Global
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apay.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@apay.com',
      name: 'Admin Global',
    },
  });

  // Create admin_global role (can't use upsert with null establishmentId)
  const existingAdminRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      establishmentId: null,
      role: 'admin_global',
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

  console.log('✅ Admin Global created: admin@apay.com');

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

  console.log(`✅ Establishment created: ${churrasquinho.name} (${churrasquinhoProducts.length} products)`);

  // 3. Criar Estabelecimento: ChoppTruck Ipanema
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

  console.log(`✅ Establishment created: ${choppTruck.name} (${choppTruckProducts.length} products)`);

  // 4. Criar usuários de exemplo para cada estabelecimento
  const garcomChurras = await prisma.user.upsert({
    where: { email: 'garcom@churrasquinho.com' },
    update: {},
    create: {
      email: 'garcom@churrasquinho.com',
      name: 'João Garçom',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_establishmentId_role: {
        userId: garcomChurras.id,
        establishmentId: churrasquinho.id,
        role: 'waiter',
      },
    },
    update: {},
    create: {
      userId: garcomChurras.id,
      establishmentId: churrasquinho.id,
      role: 'waiter',
    },
  });

  const cozinhaChurras = await prisma.user.upsert({
    where: { email: 'cozinha@churrasquinho.com' },
    update: {},
    create: {
      email: 'cozinha@churrasquinho.com',
      name: 'Maria Cozinha',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_establishmentId_role: {
        userId: cozinhaChurras.id,
        establishmentId: churrasquinho.id,
        role: 'kitchen',
      },
    },
    update: {},
    create: {
      userId: cozinhaChurras.id,
      establishmentId: churrasquinho.id,
      role: 'kitchen',
    },
  });

  console.log('✅ Sample users created for Churrasquinho');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Credentials:');
  console.log('  - Admin: admin@apay.com');
  console.log('  - Garçom: garcom@churrasquinho.com');
  console.log('  - Cozinha: cozinha@churrasquinho.com');
  console.log('\n🔑 Establishment Access Codes:');
  console.log('  - Churrasquinho da Praça: slug=churrasquinho-da-praca, code=1234');
  console.log('  - ChoppTruck Ipanema: slug=chopptruck-ipanema, code=5678');
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
