import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login - Login com email e senha
  fastify.post('/login', authController.login.bind(authController));

  // POST /auth/refresh - Renovar access token
  fastify.post('/refresh', authController.refreshToken.bind(authController));

  // GET /auth/me - Dados do usuário logado (com auth)
  fastify.get(
    '/me',
    { onRequest: [authMiddleware] },
    authController.me.bind(authController)
  );
}
