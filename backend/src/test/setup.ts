import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Mock do Prisma Client
vi.mock('../shared/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    establishment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    kitchenTicket: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userRole: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({})),
    $executeRawUnsafe: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

// Setup global antes de todos os testes
beforeAll(() => {
  // Configurações globais
});

// Cleanup depois de todos os testes
afterAll(() => {
  // Cleanup global
});

// Reset antes de cada teste
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup depois de cada teste
afterEach(() => {
  // Cleanup específico
});
