import { FastifyInstance } from 'fastify';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export async function notificationsRoutes(app: FastifyInstance) {
  // SSE endpoint para receber notificações em tempo real
  app.get(
    '/stream',
    {
      preHandler: [authMiddleware],
      schema: {
        description: 'Stream de notificações em tempo real (SSE)',
        tags: ['notifications'],
        response: {
          200: {
            description: 'Stream de eventos',
            type: 'string',
          },
        },
      },
    },
    notificationsController.streamNotifications
  );

  // Buscar notificações recentes
  app.get(
    '/recent',
    {
      preHandler: [authMiddleware],
      schema: {
        description: 'Buscar notificações recentes',
        tags: ['notifications'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                title: { type: 'string' },
                message: { type: 'string' },
                data: { type: 'object' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    notificationsController.getRecentNotifications
  );
}
