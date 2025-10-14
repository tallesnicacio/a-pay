import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service';
import { LoginSchema, RefreshTokenSchema } from './auth.schema';

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = LoginSchema.parse(request.body);
    const result = await authService.login(email, password);

    return reply.send({
      success: true,
      data: result,
      message: 'Login realizado com sucesso',
    });
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = RefreshTokenSchema.parse(request.body);
    const result = await authService.refreshToken(refreshToken);

    return reply.send({
      success: true,
      data: result,
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    // User já vem do middleware de auth
    const result = await authService.getUserById(request.user!.id);

    return reply.send({
      success: true,
      data: { user: result },
    });
  }
}

export const authController = new AuthController();
