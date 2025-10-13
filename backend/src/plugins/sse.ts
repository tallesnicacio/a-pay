import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import logger from '../shared/utils/logger';
import { prisma } from '../shared/database/prisma.service';
import { UnauthorizedError } from '../shared/utils/errors';

interface SSEClient {
  id: string;
  establishmentId: string;
  reply: FastifyReply;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Heartbeat para manter conexões vivas
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // 30 segundos
  }

  addClient(client: SSEClient) {
    this.clients.set(client.id, client);
    logger.info(
      { clientId: client.id, establishmentId: client.establishmentId },
      'SSE client connected'
    );
  }

  removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      logger.info({ clientId }, 'SSE client disconnected');
    }
  }

  broadcast(establishmentId: string, data: any) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.establishmentId === establishmentId) {
        try {
          client.reply.sse({
            id: Date.now().toString(),
            data: JSON.stringify(data),
          });
          sentCount++;
        } catch (error) {
          logger.error(
            { error, clientId: client.id },
            'Failed to send SSE message'
          );
          this.removeClient(client.id);
        }
      }
    });

    if (sentCount > 0) {
      logger.debug(
        { establishmentId, sentCount, type: data.type },
        'SSE broadcast sent'
      );
    }
  }

  private sendHeartbeat() {
    this.clients.forEach((client) => {
      try {
        client.reply.sse({
          event: 'heartbeat',
          data: JSON.stringify({ timestamp: Date.now() }),
        });
      } catch (error) {
        this.removeClient(client.id);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.clear();
  }
}

async function ssePlugin(fastify: FastifyInstance) {
  const sseManager = new SSEManager();

  // Decorar fastify com sseManager
  fastify.decorate('kitchenSSE', sseManager);

  // Adicionar decoração de SSE no reply
  fastify.decorateReply('sse', function (this: FastifyReply, data: any) {
    if (!this.raw.headersSent) {
      this.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
    }

    if (data.event) {
      this.raw.write(`event: ${data.event}\n`);
    }
    if (data.id) {
      this.raw.write(`id: ${data.id}\n`);
    }
    if (data.retry) {
      this.raw.write(`retry: ${data.retry}\n`);
    }
    if (data.data) {
      this.raw.write(`data: ${data.data}\n`);
    }
    this.raw.write('\n');
  });

  // Rota SSE para kitchen
  fastify.get(
    '/sse/kitchen',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Para SSE, aceitar token via query string devido a limitações do EventSource
        const query = request.query as { token?: string; establishmentId?: string };
        const token = query.token;
        let establishmentId = query.establishmentId || request.establishmentId;

        if (!token) {
          return reply.code(401).send({ error: 'Token required' });
        }

        // Validar token buscando usuário (MVP: token = userId)
        const user = await prisma.user.findUnique({
          where: { id: token },
          include: {
            userRoles: {
              include: {
                establishment: true,
              },
            },
          },
        });

        if (!user) {
          return reply.code(401).send({ error: 'Invalid token' });
        }

        // Se establishmentId não fornecido, usar o primeiro do usuário
        if (!establishmentId) {
          const firstRole = user.userRoles.find(role => role.establishmentId);
          establishmentId = firstRole?.establishmentId;
        }

        if (!establishmentId) {
          return reply.code(400).send({ error: 'Establishment ID required' });
        }

        // Verificar se usuário tem acesso ao estabelecimento
        const hasAccess =
          user.userRoles.some(role => role.role === 'admin_global') ||
          user.userRoles.some(role => role.establishmentId === establishmentId);

        if (!hasAccess) {
          return reply.code(403).send({ error: 'Access denied to establishment' });
        }

        const clientId = `${establishmentId}-${Date.now()}`;

        // Configurar headers SSE
        reply.sse({
          event: 'connected',
          data: JSON.stringify({
            message: 'Connected to kitchen SSE',
            establishmentId,
            userId: user.id
          }),
        });

        // Adicionar cliente
        sseManager.addClient({
          id: clientId,
          establishmentId,
          reply,
        });

        logger.info(
          { clientId, userId: user.id, establishmentId },
          'SSE kitchen connection established'
        );

        // Remover cliente quando desconectar
        request.raw.on('close', () => {
          sseManager.removeClient(clientId);
        });
      } catch (error) {
        logger.error({ error }, 'SSE connection error');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    sseManager.destroy();
  });
}

export default fastifyPlugin(ssePlugin);

// Type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    kitchenSSE?: SSEManager;
  }

  interface FastifyReply {
    sse(data: {
      event?: string;
      id?: string;
      data?: string;
      retry?: number;
    }): void;
  }
}
