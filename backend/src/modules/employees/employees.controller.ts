import { FastifyRequest, FastifyReply } from 'fastify';
import { employeesService } from './employees.service';
import { createEmployeeSchema, updateEmployeeSchema } from './employees.schema';

export class EmployeesController {
  /**
   * GET /employees - Listar funcionários
   */
  async listEmployees(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      return reply.code(400).send({
        success: false,
        error: 'Estabelecimento não definido',
      });
    }

    const employees = await employeesService.listEmployees(establishmentId);

    return reply.send({
      success: true,
      data: employees,
    });
  }

  /**
   * POST /employees - Criar funcionário
   */
  async createEmployee(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      return reply.code(400).send({
        success: false,
        error: 'Estabelecimento não definido',
      });
    }

    const data = createEmployeeSchema.parse(request.body);
    const employee = await employeesService.createEmployee(data, establishmentId);

    return reply.code(201).send({
      success: true,
      data: employee,
      message: 'Funcionário criado com sucesso',
    });
  }

  /**
   * PATCH /employees/:id - Atualizar funcionário
   */
  async updateEmployee(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      return reply.code(400).send({
        success: false,
        error: 'Estabelecimento não definido',
      });
    }

    const data = updateEmployeeSchema.parse(request.body);
    const employee = await employeesService.updateEmployee(
      id,
      data,
      establishmentId
    );

    return reply.send({
      success: true,
      data: employee,
      message: 'Funcionário atualizado com sucesso',
    });
  }

  /**
   * DELETE /employees/:id - Deletar funcionário
   */
  async deleteEmployee(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      return reply.code(400).send({
        success: false,
        error: 'Estabelecimento não definido',
      });
    }

    await employeesService.deleteEmployee(id, establishmentId);

    return reply.code(204).send();
  }
}

export const employeesController = new EmployeesController();
