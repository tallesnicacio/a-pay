import { FastifyInstance } from 'fastify';
import { kitchenController } from './kitchen.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rlsMiddleware } from '../../shared/middleware/rls.middleware';

export async function kitchenRoutes(fastify: FastifyInstance) {
  // Aplicar middlewares em todas as rotas de kitchen
  fastify.addHook('onRequest', authMiddleware);
  fastify.addHook('onRequest', rlsMiddleware);

  // GET /kitchen/tickets - Listar tickets
  fastify.get('/', kitchenController.getTickets.bind(kitchenController));

  // GET /kitchen/tickets/:id - Buscar ticket por ID
  fastify.get('/:id', kitchenController.getTicketById.bind(kitchenController));

  // PATCH /kitchen/tickets/:id - Atualizar status
  fastify.patch(
    '/:id',
    kitchenController.updateTicketStatus.bind(kitchenController)
  );

  // GET /kitchen/stats - Estatísticas da cozinha
  fastify.get(
    '/stats',
    kitchenController.getKitchenStats.bind(kitchenController)
  );
}
