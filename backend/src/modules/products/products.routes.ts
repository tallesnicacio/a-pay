import { FastifyInstance } from 'fastify';
import { productsController } from './products.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rlsMiddleware } from '../../shared/middleware/rls.middleware';

export async function productsRoutes(fastify: FastifyInstance) {
  // Aplicar middlewares em todas as rotas de produtos
  fastify.addHook('onRequest', authMiddleware);
  fastify.addHook('onRequest', rlsMiddleware);

  // GET /products - Listar produtos
  fastify.get('/', productsController.getProducts.bind(productsController));

  // GET /products/:id - Buscar produto por ID
  fastify.get('/:id', productsController.getProductById.bind(productsController));

  // POST /products - Criar produto
  fastify.post('/', productsController.createProduct.bind(productsController));

  // PATCH /products/:id - Atualizar produto
  fastify.patch('/:id', productsController.updateProduct.bind(productsController));

  // DELETE /products/:id - Deletar produto (soft delete)
  fastify.delete('/:id', productsController.deleteProduct.bind(productsController));
}
