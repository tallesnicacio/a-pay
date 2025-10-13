import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login - Login (sem auth)
  fastify.post('/login', authController.login.bind(authController));

  // POST /auth/verify - Verificar token (sem auth)
  fastify.post('/verify', authController.verifyToken.bind(authController));

  // GET /auth/me - Dados do usuário logado (com auth)
  fastify.get(
    '/me',
    { onRequest: [authMiddleware] },
    authController.me.bind(authController)
  );
}
