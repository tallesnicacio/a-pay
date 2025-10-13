import type { FastifyInstance } from 'fastify';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AdminController();

  // Todas as rotas de admin requerem autenticação
  // A verificação de admin_global é feita no service
  fastify.addHook('onRequest', authMiddleware);

  // ============================================================================
  // ESTABLISHMENTS
  // ============================================================================

  /**
   * GET /admin/establishments
   * Listar estabelecimentos (com paginação)
   * Query: ?page=1&limit=20&search=churrasquinho&isActive=true
   */
  fastify.get('/establishments', async (request, reply) => {
    return controller.listEstablishments(request, reply);
  });

  /**
   * GET /admin/establishments/:id
   * Buscar estabelecimento por ID
   */
  fastify.get('/establishments/:id', async (request, reply) => {
    return controller.getEstablishment(request, reply);
  });

  /**
   * POST /admin/establishments
   * Criar estabelecimento
   */
  fastify.post('/establishments', async (request, reply) => {
    return controller.createEstablishment(request, reply);
  });

  /**
   * PATCH /admin/establishments/:id
   * Atualizar estabelecimento
   */
  fastify.patch('/establishments/:id', async (request, reply) => {
    return controller.updateEstablishment(request, reply);
  });

  /**
   * DELETE /admin/establishments/:id
   * Deletar estabelecimento
   */
  fastify.delete('/establishments/:id', async (request, reply) => {
    return controller.deleteEstablishment(request, reply);
  });

  // ============================================================================
  // USERS
  // ============================================================================

  /**
   * GET /admin/users
   * Listar usuários (com paginação)
   * Query: ?page=1&limit=20&search=joao&isActive=true
   */
  fastify.get('/users', async (request, reply) => {
    return controller.listUsers(request, reply);
  });

  /**
   * GET /admin/users/:id
   * Buscar usuário por ID
   */
  fastify.get('/users/:id', async (request, reply) => {
    return controller.getUser(request, reply);
  });

  /**
   * POST /admin/users
   * Criar usuário
   */
  fastify.post('/users', async (request, reply) => {
    return controller.createUser(request, reply);
  });

  /**
   * PATCH /admin/users/:id
   * Atualizar usuário
   */
  fastify.patch('/users/:id', async (request, reply) => {
    return controller.updateUser(request, reply);
  });

  /**
   * DELETE /admin/users/:id
   * Deletar usuário
   */
  fastify.delete('/users/:id', async (request, reply) => {
    return controller.deleteUser(request, reply);
  });

  // ============================================================================
  // USER ROLES
  // ============================================================================

  /**
   * POST /admin/user-roles
   * Criar role (associar usuário a estabelecimento com papel)
   */
  fastify.post('/user-roles', async (request, reply) => {
    return controller.createUserRole(request, reply);
  });

  /**
   * PATCH /admin/user-roles/:id
   * Atualizar role de usuário
   */
  fastify.patch('/user-roles/:id', async (request, reply) => {
    return controller.updateUserRole(request, reply);
  });

  /**
   * DELETE /admin/user-roles/:id
   * Remover role de usuário
   */
  fastify.delete('/user-roles/:id', async (request, reply) => {
    return controller.deleteUserRole(request, reply);
  });
}
