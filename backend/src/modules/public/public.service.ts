import { prisma } from '../../shared/database/prisma.service';
import { NotFoundError } from '../../shared/utils/errors';
import { notificationsService } from '../../shared/services/notifications.service';
import type { CreatePublicOrderBody } from './public.schema';

export class PublicService {
  /**
   * Buscar cardápio público do estabelecimento
   */
  async getMenu(slug: string) {
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug,
        active: true,
        onlineOrdering: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!establishment) {
      throw new NotFoundError('Cardápio não disponível');
    }

    const products = await prisma.product.findMany({
      where: {
        establishmentId: establishment.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      establishment,
      products,
    };
  }

  /**
   * Criar pedido público (sem autenticação)
   */
  async createPublicOrder(data: CreatePublicOrderBody) {
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: data.establishmentSlug,
        active: true,
        onlineOrdering: true,
      },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        establishmentId: establishment.id,
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('Um ou mais produtos não encontrados');
    }

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

    const order = await prisma.$transaction(async tx => {
      const createdOrder = await tx.order.create({
        data: {
          establishmentId: establishment.id,
          code: data.code,
          customerName: data.customerName,
          status: 'open',
          paymentStatus: 'unpaid',
          totalAmount,
          paidAmount: 0,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      if (establishment.hasKitchen) {
        await tx.kitchenTicket.create({
          data: {
            orderId: createdOrder.id,
            status: 'queue',
          },
        });
      }

      return createdOrder;
    });

    // Emitir notificação de novo pedido em tempo real
    notificationsService.notifyNewOrder(establishment.id, order);

    return order;
  }
}

export const publicService = new PublicService();
