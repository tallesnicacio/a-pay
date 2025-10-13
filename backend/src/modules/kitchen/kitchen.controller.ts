import { FastifyRequest, FastifyReply } from 'fastify';
import { kitchenService } from './kitchen.service';
import {
  GetKitchenTicketsQuerySchema,
  UpdateTicketStatusSchema,
} from './kitchen.schema';
import { BadRequestError } from '../../shared/utils/errors';

export class KitchenController {
  async getTickets(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;
    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const query = GetKitchenTicketsQuerySchema.parse(request.query);
    const tickets = await kitchenService.getTickets(establishmentId, query);

    return reply.send({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  }

  async getTicketById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;
    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const ticket = await kitchenService.getTicketById(id, establishmentId);

    return reply.send({
      success: true,
      data: ticket,
    });
  }

  async updateTicketStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;
    const userId = request.user?.id;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }
    if (!userId) {
      throw new BadRequestError('User ID é obrigatório');
    }

    const body = UpdateTicketStatusSchema.parse(request.body);
    const ticket = await kitchenService.updateTicketStatus(
      id,
      body,
      establishmentId,
      userId
    );

    // Notificar via SSE
    request.server.kitchenSSE?.broadcast(establishmentId, {
      type: 'ticket_updated',
      data: ticket,
    });

    return reply.send({
      success: true,
      data: ticket,
      message: 'Status atualizado com sucesso',
    });
  }

  async getKitchenStats(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;
    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const stats = await kitchenService.getKitchenStats(establishmentId);

    return reply.send({
      success: true,
      data: stats,
    });
  }
}

export const kitchenController = new KitchenController();
