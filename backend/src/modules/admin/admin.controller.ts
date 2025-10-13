import type { FastifyRequest, FastifyReply } from 'fastify';
import { AdminService } from './admin.service';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  createUserSchema,
  updateUserSchema,
  createUserRoleSchema,
  updateUserRoleSchema,
  listQuerySchema,
} from './admin.schema';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ============================================================================
  // ESTABLISHMENTS
  // ============================================================================

  async listEstablishments(request: FastifyRequest, reply: FastifyReply) {
    const query = listQuerySchema.parse(request.query);
    const userId = request.user!.id;

    const result = await this.adminService.listEstablishments(query, userId);

    return reply.code(200).send({
      success: true,
      data: result.establishments,
      pagination: result.pagination,
    });
  }

  async getEstablishment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const establishment = await this.adminService.getEstablishmentById(
      id,
      userId
    );

    return reply.code(200).send({
      success: true,
      data: establishment,
    });
  }

  async createEstablishment(request: FastifyRequest, reply: FastifyReply) {
    const body = createEstablishmentSchema.parse(request.body);
    const userId = request.user!.id;

    const establishment = await this.adminService.createEstablishment(
      body,
      userId
    );

    return reply.code(201).send({
      success: true,
      data: establishment,
      message: 'Estabelecimento criado com sucesso',
    });
  }

  async updateEstablishment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateEstablishmentSchema.parse(request.body);
    const userId = request.user!.id;

    const establishment = await this.adminService.updateEstablishment(
      id,
      body,
      userId
    );

    return reply.code(200).send({
      success: true,
      data: establishment,
      message: 'Estabelecimento atualizado com sucesso',
    });
  }

  async deleteEstablishment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const result = await this.adminService.deleteEstablishment(id, userId);

    return reply.code(200).send({
      success: true,
      message: result.message,
    });
  }

  // ============================================================================
  // USERS
  // ============================================================================

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    const query = listQuerySchema.parse(request.query);
    const userId = request.user!.id;

    const result = await this.adminService.listUsers(query, userId);

    return reply.code(200).send({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  }

  async getUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const user = await this.adminService.getUserById(id, userId);

    return reply.code(200).send({
      success: true,
      data: user,
    });
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const body = createUserSchema.parse(request.body);
    const userId = request.user!.id;

    const user = await this.adminService.createUser(body, userId);

    return reply.code(201).send({
      success: true,
      data: user,
      message: 'Usuário criado com sucesso',
    });
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateUserSchema.parse(request.body);
    const userId = request.user!.id;

    const user = await this.adminService.updateUser(id, body, userId);

    return reply.code(200).send({
      success: true,
      data: user,
      message: 'Usuário atualizado com sucesso',
    });
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const result = await this.adminService.deleteUser(id, userId);

    return reply.code(200).send({
      success: true,
      message: result.message,
    });
  }

  // ============================================================================
  // USER ROLES
  // ============================================================================

  async createUserRole(request: FastifyRequest, reply: FastifyReply) {
    const body = createUserRoleSchema.parse(request.body);
    const userId = request.user!.id;

    const userRole = await this.adminService.createUserRole(body, userId);

    return reply.code(201).send({
      success: true,
      data: userRole,
      message: 'Role criada com sucesso',
    });
  }

  async updateUserRole(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateUserRoleSchema.parse(request.body);
    const userId = request.user!.id;

    const userRole = await this.adminService.updateUserRole(id, body, userId);

    return reply.code(200).send({
      success: true,
      data: userRole,
      message: 'Role atualizada com sucesso',
    });
  }

  async deleteUserRole(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const result = await this.adminService.deleteUserRole(id, userId);

    return reply.code(200).send({
      success: true,
      message: result.message,
    });
  }
}
