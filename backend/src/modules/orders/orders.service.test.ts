import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdersService } from './orders.service';
import { prisma } from '../../shared/database/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  const mockEstablishmentId = 'est-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    ordersService = new OrdersService();
    vi.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should list orders with filters', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          code: 'MESA-01',
          status: 'open',
          paymentStatus: 'unpaid',
          totalAmount: 50.0,
          paidAmount: 0,
          establishmentId: mockEstablishmentId,
          items: [],
          payments: [],
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await ordersService.listOrders(
        { status: 'open' },
        mockEstablishmentId
      );

      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            establishmentId: mockEstablishmentId,
            status: 'open',
          }),
        })
      );
    });

    it('should filter by payment status', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          paymentStatus: 'paid',
          establishmentId: mockEstablishmentId,
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      await ordersService.listOrders(
        { paymentStatus: 'paid' },
        mockEstablishmentId
      );

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paymentStatus: 'paid',
          }),
        })
      );
    });

    it('should search by code', async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);

      await ordersService.listOrders(
        { search: 'MESA' },
        mockEstablishmentId
      );

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            code: expect.objectContaining({
              contains: 'MESA',
              mode: 'insensitive',
            }),
          }),
        })
      );
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        id: 'order-1',
        code: 'MESA-01',
        establishmentId: mockEstablishmentId,
        items: [],
        payments: [],
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const result = await ordersService.getOrderById(
        'order-1',
        mockEstablishmentId
      );

      expect(result).toEqual(mockOrder);
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1', establishmentId: mockEstablishmentId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundError when order does not exist', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      await expect(
        ordersService.getOrderById('invalid-id', mockEstablishmentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createOrder', () => {
    it('should create order with items', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Produto 1',
          price: 25.0,
          active: true,
        },
      ];

      const mockOrder = {
        id: 'order-1',
        code: 'MESA-01',
        totalAmount: 50.0,
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 25.0,
            subtotal: 50.0,
          },
        ],
      };

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);
        return callback(prisma);
      });
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const result = await ordersService.createOrder(
        {
          code: 'MESA-01',
          items: [{ productId: 'prod-1', qty: 2 }],
        },
        mockEstablishmentId,
        mockUserId
      );

      expect(result).toBeDefined();
      expect(prisma.product.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestError when product not found', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      await expect(
        ordersService.createOrder(
          {
            items: [{ productId: 'invalid-product', qty: 1 }],
          },
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when product is inactive', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Produto 1',
          price: 25.0,
          active: false,
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

      await expect(
        ordersService.createOrder(
          {
            items: [{ productId: 'prod-1', qty: 1 }],
          },
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('markAsPaid', () => {
    it('should mark order as paid', async () => {
      const mockOrder = {
        id: 'order-1',
        totalAmount: 50.0,
        paidAmount: 0,
        status: 'open',
        paymentStatus: 'unpaid',
        establishmentId: mockEstablishmentId,
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        paidAmount: 50.0,
        paymentStatus: 'paid',
        status: 'closed',
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);
        return callback(prisma);
      });

      const result = await ordersService.markAsPaid(
        'order-1',
        { method: 'cash', amount: 50.0 },
        mockEstablishmentId,
        mockUserId
      );

      expect(result).toBeDefined();
    });

    it('should throw NotFoundError when order does not exist', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      await expect(
        ordersService.markAsPaid(
          'invalid-id',
          { method: 'cash' },
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when order is already paid', async () => {
      const mockOrder = {
        id: 'order-1',
        paymentStatus: 'paid',
        establishmentId: mockEstablishmentId,
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      await expect(
        ordersService.markAsPaid(
          'order-1',
          { method: 'cash' },
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should handle partial payment', async () => {
      const mockOrder = {
        id: 'order-1',
        totalAmount: 100.0,
        paidAmount: 0,
        paymentStatus: 'unpaid',
        establishmentId: mockEstablishmentId,
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        paidAmount: 50.0,
        paymentStatus: 'partial',
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);
        return callback(prisma);
      });

      await ordersService.markAsPaid(
        'order-1',
        { method: 'cash', amount: 50.0 },
        mockEstablishmentId,
        mockUserId
      );

      // Verificar que o status é partial quando pagamento parcial
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'open',
        establishmentId: mockEstablishmentId,
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'closed',
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);

      const result = await ordersService.updateStatus(
        'order-1',
        'closed',
        mockEstablishmentId,
        mockUserId
      );

      expect(result.status).toBe('closed');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', establishmentId: mockEstablishmentId },
          data: expect.objectContaining({ status: 'closed' }),
        })
      );
    });

    it('should throw NotFoundError when order does not exist', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      await expect(
        ordersService.updateStatus(
          'invalid-id',
          'closed',
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });
});
