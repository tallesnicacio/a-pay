import { FastifyRequest, FastifyReply } from 'fastify';
import { notificationsService } from '../../shared/services/notifications.service';

export class NotificationsController {
  /**
   * Stream de notificações em tempo real usando Server-Sent Events (SSE)
   */
  async streamNotifications(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      reply.code(400).send({ error: 'establishmentId é obrigatório' });
      return;
    }

    // Configurar headers para SSE
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Enviar comentário inicial para manter conexão viva
    reply.raw.write(': connected\n\n');

    // Listener para novas notificações
    const listener = (notification: any) => {
      const data = JSON.stringify(notification);
      reply.raw.write(`data: ${data}\n\n`);
    };

    // Registrar listener
    const eventName = `notification:${establishmentId}`;
    notificationsService.on(eventName, listener);

    // Enviar notificações recentes ao conectar
    const recentNotifications = notificationsService.getRecentNotifications(
      establishmentId,
      5
    );

    if (recentNotifications.length > 0) {
      setTimeout(() => {
        recentNotifications.reverse().forEach(notification => {
          const data = JSON.stringify(notification);
          reply.raw.write(`data: ${data}\n\n`);
        });
      }, 100);
    }

    // Keepalive: enviar ping a cada 30 segundos
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': ping\n\n');
    }, 30000);

    // Cleanup quando conexão fechar
    request.raw.on('close', () => {
      clearInterval(keepAliveInterval);
      notificationsService.off(eventName, listener);
    });
  }

  /**
   * Buscar notificações recentes
   */
  async getRecentNotifications(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      return reply.code(400).send({ error: 'establishmentId é obrigatório' });
    }

    const notifications = notificationsService.getRecentNotifications(
      establishmentId,
      20
    );

    return reply.send(notifications);
  }
}

export const notificationsController = new NotificationsController();
