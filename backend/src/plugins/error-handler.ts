import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../shared/utils/errors';
import logger from '../shared/utils/logger';

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: FastifyError | AppError | ZodError, request: FastifyRequest, reply: FastifyReply) => {
      // Log do erro
      logger.error({
        err: error,
        url: request.url,
        method: request.method,
        params: request.params,
        query: request.query,
      }, 'Request error');

      // Erro de validação Zod
      if (error instanceof ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Erro de validação',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Erro da aplicação
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: error.message,
        });
      }

      // Erro do Fastify
      if (error.statusCode) {
        return reply.code(error.statusCode).send({
          success: false,
          error: error.message,
        });
      }

      // Erro desconhecido
      return reply.code(500).send({
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erro interno do servidor'
          : error.message,
      });
    }
  );
}
