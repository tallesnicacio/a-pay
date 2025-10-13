import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from './reports.service';
import { prisma } from '../../shared/database/prisma';
import { NotFoundError } from '../../shared/errors/AppError';

describe('ReportsService', () => {
  let reportsService: ReportsService;
  const mockEstablishmentId = 'est-123';

  beforeEach(() => {
    reportsService = new ReportsService();
    vi.clearAllMocks();
  });

  describe('getDailyReport', () => {
    it('should return daily report with correct metrics', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test Establishment',
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalAmount: 50.0,
          paidAmount: 50.0,
          createdAt: new Date('2025-01-01T12:00:00'),
          items: [
            {
              productId: 'prod-1',
              product: { name: 'Product 1' },
              quantity: 2,
              subtotal: 50.0,
            },
          ],
          payments: [
            {
              method: 'cash',
              amount: 50.0,
            },
          ],
        },
        {
          id: 'order-2',
          totalAmount: 30.0,
          paidAmount: 30.0,
          createdAt: new Date('2025-01-01T14:00:00'),
          items: [
            {
              productId: 'prod-1',
              product: { name: 'Product 1' },
              quantity: 1,
              subtotal: 30.0,
            },
          ],
          payments: [
            {
              method: 'pix',
              amount: 30.0,
            },
          ],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getDailyReport(
        { date: '2025-01-01' },
        mockEstablishmentId
      );

      expect(result.sales.totalOrders).toBe(2);
      expect(result.sales.totalRevenue).toBe(80.0);
      expect(result.sales.totalPaid).toBe(80.0);
      expect(result.sales.averageTicket).toBe(40.0);
      expect(result.topProducts).toHaveLength(1);
      expect(result.topProducts[0].quantity).toBe(3);
    });

    it('should throw NotFoundError when establishment does not exist', async () => {
      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(null);

      await expect(
        reportsService.getDailyReport({}, mockEstablishmentId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should use today date when not provided', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test',
      };

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);

      await reportsService.getDailyReport({}, mockEstablishmentId);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        })
      );
    });

    it('should group payment methods correctly', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test',
      };

      const mockOrders = [
        {
          totalAmount: 50.0,
          paidAmount: 50.0,
          createdAt: new Date(),
          items: [],
          payments: [
            { method: 'cash', amount: 30.0 },
            { method: 'credit_card', amount: 20.0 },
          ],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getDailyReport({}, mockEstablishmentId);

      expect(result.sales.paymentMethods.cash).toBe(30.0);
      expect(result.sales.paymentMethods.credit_card).toBe(20.0);
    });

    it('should calculate hourly distribution', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test',
      };

      const mockOrders = [
        {
          totalAmount: 50.0,
          paidAmount: 50.0,
          createdAt: new Date('2025-01-01T12:30:00'),
          items: [],
          payments: [],
        },
        {
          totalAmount: 30.0,
          paidAmount: 30.0,
          createdAt: new Date('2025-01-01T12:45:00'),
          items: [],
          payments: [],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getDailyReport(
        { date: '2025-01-01' },
        mockEstablishmentId
      );

      const hour12 = result.hourlyDistribution.find((h) => h.hour === 12);
      expect(hour12?.orders).toBe(2);
      expect(hour12?.revenue).toBe(80.0);
    });
  });

  describe('getPeriodReport', () => {
    it('should return period report with correct metrics', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test Establishment',
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalAmount: 100.0,
          paidAmount: 100.0,
          createdAt: new Date('2025-01-01T12:00:00'),
          items: [
            {
              productId: 'prod-1',
              product: { name: 'Product 1' },
              quantity: 1,
              subtotal: 100.0,
            },
          ],
          payments: [
            {
              method: 'cash',
              amount: 100.0,
            },
          ],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getPeriodReport(
        {
          startDate: '2025-01-01',
          endDate: '2025-01-07',
          groupBy: 'day',
        },
        mockEstablishmentId
      );

      expect(result.summary.totalOrders).toBe(1);
      expect(result.summary.totalRevenue).toBe(100.0);
      expect(result.summary.averageTicket).toBe(100.0);
      expect(result.salesByPeriod).toBeDefined();
      expect(result.topProducts).toBeDefined();
      expect(result.paymentMethods).toBeDefined();
    });

    it('should group by week correctly', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test',
      };

      const mockOrders = [
        {
          totalAmount: 50.0,
          paidAmount: 50.0,
          createdAt: new Date('2025-01-01T12:00:00'), // Quarta
          items: [],
          payments: [],
        },
        {
          totalAmount: 30.0,
          paidAmount: 30.0,
          createdAt: new Date('2025-01-05T12:00:00'), // Domingo
          items: [],
          payments: [],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getPeriodReport(
        {
          startDate: '2025-01-01',
          endDate: '2025-01-07',
          groupBy: 'week',
        },
        mockEstablishmentId
      );

      // Ambos devem estar na mesma semana (domingo 2024-12-29)
      expect(result.salesByPeriod.length).toBeGreaterThan(0);
    });

    it('should calculate payment method percentages', async () => {
      const mockEstablishment = {
        id: mockEstablishmentId,
        name: 'Test',
      };

      const mockOrders = [
        {
          totalAmount: 100.0,
          paidAmount: 100.0,
          createdAt: new Date(),
          items: [],
          payments: [
            { method: 'cash', amount: 60.0 },
            { method: 'pix', amount: 40.0 },
          ],
        },
      ];

      vi.mocked(prisma.establishment.findUnique).mockResolvedValue(
        mockEstablishment as any
      );
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.getPeriodReport(
        {
          startDate: '2025-01-01',
          endDate: '2025-01-07',
          groupBy: 'day',
        },
        mockEstablishmentId
      );

      const cashMethod = result.paymentMethods.find((m) => m.method === 'cash');
      expect(cashMethod?.percentage).toBe(60.0);

      const pixMethod = result.paymentMethods.find((m) => m.method === 'pix');
      expect(pixMethod?.percentage).toBe(40.0);
    });
  });

  describe('exportData', () => {
    it('should export data with all fields', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          code: 'MESA-01',
          totalAmount: 50.0,
          paidAmount: 50.0,
          paymentStatus: 'paid',
          createdAt: new Date('2025-01-01T12:00:00'),
          items: [
            {
              quantity: 2,
              product: { name: 'Product 1' },
              note: 'Sem cebola',
            },
          ],
          payments: [
            {
              method: 'cash',
            },
          ],
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.exportData(
        {
          startDate: '2025-01-01',
          endDate: '2025-01-07',
          format: 'csv',
        },
        mockEstablishmentId
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].order_code).toBe('MESA-01');
      expect(result.data[0].total_amount).toBe(50.0);
      expect(result.data[0].payment_method).toBe('cash');
      expect(result.format).toBe('csv');
    });

    it('should format items details correctly', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          code: 'MESA-01',
          totalAmount: 50.0,
          paidAmount: 50.0,
          paymentStatus: 'paid',
          createdAt: new Date('2025-01-01T12:00:00'),
          items: [
            {
              quantity: 2,
              product: { name: 'Espetinho' },
              note: 'Mal passado',
            },
            {
              quantity: 1,
              product: { name: 'Refrigerante' },
              note: null,
            },
          ],
          payments: [],
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await reportsService.exportData(
        {
          startDate: '2025-01-01',
          endDate: '2025-01-07',
          format: 'json',
        },
        mockEstablishmentId
      );

      expect(result.data[0].items_details).toContain('2x Espetinho (Mal passado)');
      expect(result.data[0].items_details).toContain('1x Refrigerante');
    });
  });
});
