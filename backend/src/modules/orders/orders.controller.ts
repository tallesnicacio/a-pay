import { FastifyRequest, FastifyReply } from 'fastify';
import { ordersService } from './orders.service';
import {
  CreateOrderSchema,
  GetOrdersQuerySchema,
  MarkPaidSchema,
  UpdateOrderStatusSchema,
} from './orders.schema';
import { BadRequestError } from '../../shared/utils/errors';

export class OrdersController {
  async getOrders(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;
    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const query = GetOrdersQuerySchema.parse(request.query);
    const orders = await ordersService.getOrders(establishmentId, query);

    return reply.send({
      success: true,
      data: orders,
      count: orders.length,
    });
  }

  async getOrderById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;
    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const order = await ordersService.getOrderById(id, establishmentId);

    return reply.send({
      success: true,
      data: order,
    });
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;
    const userId = request.user?.id;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }
    if (!userId) {
      throw new BadRequestError('User ID é obrigatório');
    }

    const body = CreateOrderSchema.parse(request.body);
    const order = await ordersService.createOrder(
      body,
      establishmentId,
      userId
    );

    // Notificar via SSE se houver kitchen ticket
    if (order.kitchenTickets && order.kitchenTickets.length > 0) {
      request.server.kitchenSSE?.broadcast(establishmentId, {
        type: 'ticket_created',
        data: order.kitchenTickets[0],
      });
    }

    return reply.code(201).send({
      success: true,
      data: order,
      message: 'Comanda criada com sucesso',
    });
  }

  async markAsPaid(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;
    const userId = request.user?.id;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }
    if (!userId) {
      throw new BadRequestError('User ID é obrigatório');
    }

    const body = MarkPaidSchema.parse(request.body);
    const order = await ordersService.markAsPaid(
      id,
      body,
      establishmentId,
      userId
    );

    return reply.send({
      success: true,
      data: order,
      message: 'Pagamento registrado com sucesso',
    });
  }

  async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;
    const userId = request.user?.id;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }
    if (!userId) {
      throw new BadRequestError('User ID é obrigatório');
    }

    const body = UpdateOrderStatusSchema.parse(request.body);
    const order = await ordersService.updateOrderStatus(
      id,
      body,
      establishmentId,
      userId
    );

    return reply.send({
      success: true,
      data: order,
      message: 'Status atualizado com sucesso',
    });
  }
}

export const ordersController = new OrdersController();
