import { FastifyInstance } from 'fastify';
import { publicController } from './public.controller';

export async function publicRoutes(fastify: FastifyInstance) {
  // GET /public/menu/:slug - Buscar cardápio público (SEM autenticação)
  fastify.get('/menu/:slug', publicController.getMenu.bind(publicController));

  // POST /public/orders - Criar pedido do cliente (SEM autenticação)
  fastify.post('/orders', publicController.createOrder.bind(publicController));
}
