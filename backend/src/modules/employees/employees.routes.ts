import { FastifyInstance } from 'fastify';
import { employeesController } from './employees.controller';
import { authMiddleware, requireOwner } from '../../shared/middleware/auth.middleware';

export async function employeesRoutes(fastify: FastifyInstance) {
  // Todas as rotas de funcionários requerem autenticação e role owner
  fastify.addHook('onRequest', authMiddleware);
  fastify.addHook('onRequest', requireOwner());

  /**
   * GET /employees - Listar funcionários
   */
  fastify.get('/', {
    schema: {
      tags: ['employees'],
      summary: 'Listar funcionários do estabelecimento',
      description: 'Retorna lista de funcionários do estabelecimento do owner logado',
      response: {
        200: {
          description: 'Lista de funcionários',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  active: { type: 'boolean' },
                  role: { type: 'string', enum: ['owner', 'user'] },
                  permissions: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      modules: {
                        type: 'object',
                        properties: {
                          orders: { type: 'boolean' },
                          kitchen: { type: 'boolean' },
                          reports: { type: 'boolean' },
                        },
                      },
                    },
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    handler: employeesController.listEmployees.bind(employeesController),
  });

  /**
   * POST /employees - Criar funcionário
   */
  fastify.post('/', {
    schema: {
      tags: ['employees'],
      summary: 'Criar novo funcionário',
      description: 'Cria um novo funcionário para o estabelecimento do owner logado',
      body: {
        type: 'object',
        required: ['email', 'name', 'password', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 3 },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['owner', 'user'] },
          permissions: {
            type: 'object',
            properties: {
              modules: {
                type: 'object',
                properties: {
                  orders: { type: 'boolean' },
                  kitchen: { type: 'boolean' },
                  reports: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      response: {
        201: {
          description: 'Funcionário criado com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                active: { type: 'boolean' },
                role: { type: 'string' },
                permissions: { type: 'object', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: employeesController.createEmployee.bind(employeesController),
  });

  /**
   * PATCH /employees/:id - Atualizar funcionário
   */
  fastify.patch('/:id', {
    schema: {
      tags: ['employees'],
      summary: 'Atualizar funcionário',
      description: 'Atualiza dados de um funcionário do estabelecimento',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          active: { type: 'boolean' },
          permissions: {
            type: 'object',
            properties: {
              modules: {
                type: 'object',
                properties: {
                  orders: { type: 'boolean' },
                  kitchen: { type: 'boolean' },
                  reports: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      response: {
        200: {
          description: 'Funcionário atualizado com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                active: { type: 'boolean' },
                role: { type: 'string' },
                permissions: { type: 'object', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: employeesController.updateEmployee.bind(employeesController),
  });

  /**
   * DELETE /employees/:id - Deletar funcionário
   */
  fastify.delete('/:id', {
    schema: {
      tags: ['employees'],
      summary: 'Deletar funcionário',
      description: 'Remove um funcionário do estabelecimento (não pode remover owner)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        204: {
          description: 'Funcionário deletado com sucesso',
          type: 'null',
        },
      },
    },
    handler: employeesController.deleteEmployee.bind(employeesController),
  });
}
