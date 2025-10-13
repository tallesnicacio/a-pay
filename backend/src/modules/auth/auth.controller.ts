import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service';
import { LoginSchema, VerifyTokenSchema } from './auth.schema';

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email } = LoginSchema.parse(request.body);
    const result = await authService.login(email);

    return reply.send({
      success: true,
      data: result,
      message: 'Login realizado com sucesso',
    });
  }

  async verifyToken(request: FastifyRequest, reply: FastifyReply) {
    const { token } = VerifyTokenSchema.parse(request.body);
    const result = await authService.verifyToken(token);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    // User já vem do middleware de auth, mas precisamos buscar establishments
    const result = await authService.getUserById(request.user!.id);

    return reply.send({
      success: true,
      data: { user: result },
    });
  }
}

export const authController = new AuthController();
