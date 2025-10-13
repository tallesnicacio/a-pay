import { prisma } from '../../shared/database/prisma.service';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import {
  createAuditLog,
  AuditActions,
  AuditEntities,
} from '../../shared/utils/audit';
import {
  GetKitchenTicketsQuery,
  UpdateTicketStatusBody,
} from './kitchen.schema';
import { Prisma, KitchenTicketStatus } from '@prisma/client';

export class KitchenService {
  /**
   * Listar tickets da cozinha
   */
  async getTickets(establishmentId: string, query: GetKitchenTicketsQuery) {
    const where: Prisma.KitchenTicketWhereInput = {
      order: {
        establishmentId,
      },
    };

    if (query.status) {
      where.status = query.status;
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

    const tickets = await prisma.kitchenTicket.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // queue primeiro
        { createdAt: 'asc' }, // mais antigos primeiro
      ],
      take: query.limit || 50,
    });

    return tickets;
  }

  /**
   * Buscar ticket por ID
   */
  async getTicketById(id: string, establishmentId: string) {
    const ticket = await prisma.kitchenTicket.findFirst({
      where: {
        id,
        order: {
          establishmentId,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket não encontrado');
    }

    return ticket;
  }

  /**
   * Atualizar status do ticket
   */
  async updateTicketStatus(
    id: string,
    data: UpdateTicketStatusBody,
    establishmentId: string,
    userId: string
  ) {
    const ticket = await this.getTicketById(id, establishmentId);

    // Validar transição de status
    this.validateStatusTransition(ticket.status, data.status);

    const updatedTicket = await prisma.kitchenTicket.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      establishmentId,
      userId,
      action: AuditActions.CHANGE_KITCHEN_STATUS,
      entity: AuditEntities.KITCHEN_TICKET,
      entityId: id,
      payload: {
        oldStatus: ticket.status,
        newStatus: data.status,
        orderId: ticket.orderId,
        ticketNumber: ticket.ticketNumber,
      },
    });

    return updatedTicket;
  }

  /**
   * Validar se a transição de status é válida
   */
  private validateStatusTransition(
    currentStatus: KitchenTicketStatus,
    newStatus: KitchenTicketStatus
  ) {
    const validTransitions: Record<
      KitchenTicketStatus,
      KitchenTicketStatus[]
    > = {
      queue: ['preparing', 'delivered'], // pode pular para delivered se for muito rápido
      preparing: ['ready', 'queue'], // pode voltar para fila
      ready: ['delivered', 'preparing'], // pode voltar para preparando
      delivered: ['queue'], // pode reabrir (caso de erro)
    };

    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestError(
        `Transição inválida de ${currentStatus} para ${newStatus}`
      );
    }
  }

  /**
   * Obter estatísticas da cozinha (para dashboard)
   */
  async getKitchenStats(establishmentId: string) {
    const [queue, preparing, ready, delivered] = await Promise.all([
      prisma.kitchenTicket.count({
        where: {
          status: 'queue',
          order: { establishmentId },
        },
      }),
      prisma.kitchenTicket.count({
        where: {
          status: 'preparing',
          order: { establishmentId },
        },
      }),
      prisma.kitchenTicket.count({
        where: {
          status: 'ready',
          order: { establishmentId },
        },
      }),
      prisma.kitchenTicket.count({
        where: {
          status: 'delivered',
          order: { establishmentId },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // hoje
          },
        },
      }),
    ]);

    // Calcular tempo médio por status (últimos 10 tickets entregues)
    const recentDelivered = await prisma.kitchenTicket.findMany({
      where: {
        status: 'delivered',
        order: { establishmentId },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let averageTime = 0;
    if (recentDelivered.length > 0) {
      const totalTime = recentDelivered.reduce((acc, ticket) => {
        const diff = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
        return acc + diff;
      }, 0);
      averageTime = Math.floor(totalTime / recentDelivered.length / 1000 / 60); // minutos
    }

    return {
      queue,
      preparing,
      ready,
      delivered: delivered, // hoje
      averageTimeMinutes: averageTime,
    };
  }
}

export const kitchenService = new KitchenService();
