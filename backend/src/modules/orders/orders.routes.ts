import { FastifyInstance } from 'fastify';
import { ordersController } from './orders.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rlsMiddleware } from '../../shared/middleware/rls.middleware';

export async function ordersRoutes(fastify: FastifyInstance) {
  // Aplicar middlewares em todas as rotas de orders
  fastify.addHook('onRequest', authMiddleware);
  fastify.addHook('onRequest', rlsMiddleware);

  // GET /orders - Listar comandas
  fastify.get('/', ordersController.getOrders.bind(ordersController));

  // GET /orders/:id - Buscar comanda por ID
  fastify.get('/:id', ordersController.getOrderById.bind(ordersController));

  // POST /orders - Criar comanda
  fastify.post('/', ordersController.createOrder.bind(ordersController));

  // PATCH /orders/:id/pay - Marcar comanda como paga
  fastify.patch('/:id/pay', ordersController.markAsPaid.bind(ordersController));

  // PATCH /orders/:id/status - Atualizar status da comanda
  fastify.patch(
    '/:id/status',
    ordersController.updateOrderStatus.bind(ordersController)
  );
}
