import Fastify from 'fastify';
import { config } from 'dotenv';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from './shared/database/prisma.service';
import { errorHandler } from './plugins/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { productsRoutes } from './modules/products/products.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { kitchenRoutes } from './modules/kitchen/kitchen.routes';
import { reportsRoutes } from './modules/reports/reports.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import ssePlugin from './plugins/sse';
import logger from './shared/utils/logger';
import { env } from './shared/config/env';

// Load environment variables
config();

// Validate environment variables at startup
const PORT = env.PORT;
const HOST = env.HOST;
const NODE_ENV = env.NODE_ENV;

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport:
      NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function registerPlugins() {
  // Error handler
  await fastify.register(errorHandler);

  // CORS - Support multiple origins (comma-separated in .env)
  const corsOrigins = env.CORS_ORIGIN
    .split(',')
    .map(origin => origin.trim());

  await fastify.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable for development
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // SSE (Server-Sent Events) for real-time updates
  await fastify.register(ssePlugin);
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        database: 'connected',
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(503);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  });

  // Root endpoint
  fastify.get('/', async (request, reply) => {
    return {
      name: 'A-Pay API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/auth/*',
        products: '/products',
        orders: '/orders',
        kitchen: '/kitchen/tickets',
        reports: '/reports/*',
        admin: '/admin/*',
      },
    };
  });

  // API Routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(productsRoutes, { prefix: '/products' });
  await fastify.register(ordersRoutes, { prefix: '/orders' });
  await fastify.register(kitchenRoutes, { prefix: '/kitchen/tickets' });
  await fastify.register(reportsRoutes, { prefix: '/reports' });
  await fastify.register(adminRoutes, { prefix: '/admin' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ port: PORT, host: HOST });

    logger.info(`🚀 A-Pay API running on http://${HOST}:${PORT}`);
    logger.info(`📊 Environment: ${NODE_ENV}`);
    logger.info(`🔗 Health check: http://${HOST}:${PORT}/health`);
    logger.info(`📚 API docs: http://${HOST}:${PORT}/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing server...`);
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the server
start();
