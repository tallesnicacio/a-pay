import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/utils/errors';
import logger from '../shared/utils/logger';

/**
 * Error handler global do Fastify
 * Trata erros de Zod, Prisma, AppError e erros desconhecidos
 */
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

      // Erros do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(error, reply);
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return reply.code(400).send({
          success: false,
          error: 'Erro de validação dos dados',
        });
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        return reply.code(503).send({
          success: false,
          error: 'Erro de conexão com o banco de dados',
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

/**
 * Trata erros específicos do Prisma
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, reply: FastifyReply) {
  switch (error.code) {
    // Unique constraint failed
    case 'P2002': {
      const target = (error.meta?.target as string[]) || [];
      return reply.code(409).send({
        success: false,
        error: `Já existe um registro com este ${target.join(', ')}`,
      });
    }

    // Record not found
    case 'P2025':
      return reply.code(404).send({
        success: false,
        error: 'Registro não encontrado',
      });

    // Foreign key constraint failed
    case 'P2003':
      return reply.code(400).send({
        success: false,
        error: 'Operação inválida: registro relacionado não encontrado',
      });

    // Required field missing
    case 'P2011':
      return reply.code(400).send({
        success: false,
        error: 'Campo obrigatório não fornecido',
      });

    // Null constraint violation
    case 'P2012':
      return reply.code(400).send({
        success: false,
        error: 'Campo obrigatório não pode ser nulo',
      });

    // Database timeout
    case 'P2024':
      return reply.code(504).send({
        success: false,
        error: 'Tempo de resposta do banco de dados excedido',
      });

    // Connection error
    case 'P1001':
    case 'P1002':
      return reply.code(503).send({
        success: false,
        error: 'Erro de conexão com o banco de dados',
      });

    // Default for unknown Prisma errors
    default:
      logger.error({ code: error.code, meta: error.meta }, 'Unhandled Prisma error');
      return reply.code(500).send({
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erro ao processar a requisição'
          : `Database error: ${error.code}`,
      });
  }
}
