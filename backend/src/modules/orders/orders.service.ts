import { prisma } from '../../shared/database/prisma.service';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import {
  createAuditLog,
  AuditActions,
  AuditEntities,
} from '../../shared/utils/audit';
import {
  CreateOrderBody,
  GetOrdersQuery,
  MarkPaidBody,
  UpdateOrderStatusBody,
} from './orders.schema';
import { Prisma } from '@prisma/client';

export class OrdersService {
  /**
   * Listar comandas com filtros
   */
  async getOrders(establishmentId: string, query: GetOrdersQuery) {
    const where: Prisma.OrderWhereInput = {
      establishmentId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query.startDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.endDate),
      };
    }

    if (query.search) {
      where.code = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        kitchenTickets: {
          select: {
            ticketNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  /**
   * Buscar comanda por ID
   */
  async getOrderById(id: string, establishmentId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id,
        establishmentId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        kitchenTickets: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Comanda não encontrada');
    }

    return order;
  }

  /**
   * Criar nova comanda
   */
  async createOrder(
    data: CreateOrderBody,
    establishmentId: string,
    userId: string
  ) {
    // Buscar produtos e calcular total
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: data.items.map(item => item.productId),
        },
        establishmentId,
        active: true,
      },
    });

    if (products.length !== data.items.length) {
      throw new BadRequestError('Um ou mais produtos não encontrados');
    }

    // Calcular total
    let totalAmount = 0;
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const subtotal = Number(product.price) * item.qty;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        productName: product.name,
        qty: item.qty,
        unitPrice: product.price,
        note: item.note,
      };
    });

    // Verificar se estabelecimento tem cozinha
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    // Criar transação
    const order = await prisma.$transaction(async tx => {
      // Criar order
      const createdOrder = await tx.order.create({
        data: {
          establishmentId,
          code: data.code,
          status: 'open',
          paymentStatus: data.payNow ? 'paid' : 'unpaid',
          totalAmount,
          paidAmount: data.payNow ? totalAmount : 0,
          createdBy: userId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Se pagar agora, criar payment
      if (data.payNow && data.paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            method: data.paymentMethod,
            amount: totalAmount,
            receivedBy: userId,
          },
        });
      }

      // Se estabelecimento tem cozinha, criar ticket
      if (establishment?.hasKitchen) {
        await tx.kitchenTicket.create({
          data: {
            orderId: createdOrder.id,
            status: 'queue',
          },
        });
      }

      return createdOrder;
    });

    // Audit log
    await createAuditLog({
      establishmentId,
      userId,
      action: AuditActions.CREATE_ORDER,
      entity: AuditEntities.ORDER,
      entityId: order.id,
      payload: {
        code: data.code,
        totalAmount,
        itemsCount: data.items.length,
        paymentStatus: data.payNow ? 'paid' : 'unpaid',
      },
    });

    return await this.getOrderById(order.id, establishmentId);
  }

  /**
   * Marcar comanda como paga
   */
  async markAsPaid(
    id: string,
    data: MarkPaidBody,
    establishmentId: string,
    userId: string
  ) {
    const order = await this.getOrderById(id, establishmentId);

    if (order.status === 'canceled') {
      throw new BadRequestError('Não é possível pagar comanda cancelada');
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestError('Comanda já está paga');
    }

    const paymentAmount = data.amount || Number(order.totalAmount);
    const newPaidAmount = Number(order.paidAmount) + paymentAmount;
    const totalAmount = Number(order.totalAmount);

    let newPaymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
    if (newPaidAmount >= totalAmount) {
      newPaymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial';
    }

    // Atualizar em transação
    const updatedOrder = await prisma.$transaction(async tx => {
      // Criar payment
      await tx.payment.create({
        data: {
          orderId: id,
          method: data.method,
          amount: paymentAmount,
          receivedBy: userId,
        },
      });

      // Atualizar order
      const updated = await tx.order.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          closedAt: newPaymentStatus === 'paid' ? new Date() : order.closedAt,
        },
      });

      return updated;
    });

    // Audit log
    await createAuditLog({
      establishmentId,
      userId,
      action: AuditActions.MARK_PAID,
      entity: AuditEntities.ORDER,
      entityId: id,
      payload: {
        method: data.method,
        amount: paymentAmount,
        newPaymentStatus,
      },
    });

    return await this.getOrderById(id, establishmentId);
  }

  /**
   * Atualizar status da comanda
   */
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusBody,
    establishmentId: string,
    userId: string
  ) {
    const order = await this.getOrderById(id, establishmentId);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        closedAt: data.status === 'closed' ? new Date() : null,
      },
    });

    // Audit log
    await createAuditLog({
      establishmentId,
      userId,
      action: AuditActions.UPDATE_ORDER,
      entity: AuditEntities.ORDER,
      entityId: id,
      payload: {
        oldStatus: order.status,
        newStatus: data.status,
      },
    });

    return await this.getOrderById(id, establishmentId);
  }
}

export const ordersService = new OrdersService();
