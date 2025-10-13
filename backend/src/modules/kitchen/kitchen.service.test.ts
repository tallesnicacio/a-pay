import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KitchenService } from './kitchen.service';
import { prisma } from '../../shared/database/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';

describe('KitchenService', () => {
  let kitchenService: KitchenService;
  const mockEstablishmentId = 'est-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    kitchenService = new KitchenService();
    vi.clearAllMocks();
  });

  describe('listTickets', () => {
    it('should list tickets with filters', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          orderId: 'order-1',
          ticketNumber: 1,
          status: 'queue',
          order: {
            establishmentId: mockEstablishmentId,
          },
        },
      ];

      vi.mocked(prisma.kitchenTicket.findMany).mockResolvedValue(
        mockTickets as any
      );

      const result = await kitchenService.listTickets(
        { status: 'queue' },
        mockEstablishmentId
      );

      expect(result).toEqual(mockTickets);
      expect(prisma.kitchenTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: { establishmentId: mockEstablishmentId },
            status: 'queue',
          }),
        })
      );
    });

    it('should limit results when specified', async () => {
      vi.mocked(prisma.kitchenTicket.findMany).mockResolvedValue([]);

      await kitchenService.listTickets(
        { limit: 10 },
        mockEstablishmentId
      );

      expect(prisma.kitchenTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe('getTicketById', () => {
    it('should return ticket by id', async () => {
      const mockTicket = {
        id: 'ticket-1',
        order: {
          establishmentId: mockEstablishmentId,
        },
      };

      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(
        mockTicket as any
      );

      const result = await kitchenService.getTicketById(
        'ticket-1',
        mockEstablishmentId
      );

      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(null);

      await expect(
        kitchenService.getTicketById('invalid-id', mockEstablishmentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status from queue to preparing', async () => {
      const mockTicket = {
        id: 'ticket-1',
        status: 'queue',
        order: {
          establishmentId: mockEstablishmentId,
        },
      };

      const mockUpdatedTicket = {
        ...mockTicket,
        status: 'preparing',
      };

      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(
        mockTicket as any
      );
      vi.mocked(prisma.kitchenTicket.update).mockResolvedValue(
        mockUpdatedTicket as any
      );

      const result = await kitchenService.updateTicketStatus(
        'ticket-1',
        'preparing',
        mockEstablishmentId,
        mockUserId
      );

      expect(result.status).toBe('preparing');
    });

    it('should allow transition from queue to delivered (fast order)', async () => {
      const mockTicket = {
        id: 'ticket-1',
        status: 'queue',
        order: {
          establishmentId: mockEstablishmentId,
        },
      };

      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(
        mockTicket as any
      );
      vi.mocked(prisma.kitchenTicket.update).mockResolvedValue({
        ...mockTicket,
        status: 'delivered',
      } as any);

      await kitchenService.updateTicketStatus(
        'ticket-1',
        'delivered',
        mockEstablishmentId,
        mockUserId
      );

      expect(prisma.kitchenTicket.update).toHaveBeenCalled();
    });

    it('should throw BadRequestError on invalid transition', async () => {
      const mockTicket = {
        id: 'ticket-1',
        status: 'ready',
        order: {
          establishmentId: mockEstablishmentId,
        },
      };

      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(
        mockTicket as any
      );

      await expect(
        kitchenService.updateTicketStatus(
          'ticket-1',
          'queue',
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should allow going back from preparing to queue', async () => {
      const mockTicket = {
        id: 'ticket-1',
        status: 'preparing',
        order: {
          establishmentId: mockEstablishmentId,
        },
      };

      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(
        mockTicket as any
      );
      vi.mocked(prisma.kitchenTicket.update).mockResolvedValue({
        ...mockTicket,
        status: 'queue',
      } as any);

      await kitchenService.updateTicketStatus(
        'ticket-1',
        'queue',
        mockEstablishmentId,
        mockUserId
      );

      expect(prisma.kitchenTicket.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      vi.mocked(prisma.kitchenTicket.findFirst).mockResolvedValue(null);

      await expect(
        kitchenService.updateTicketStatus(
          'invalid-id',
          'preparing',
          mockEstablishmentId,
          mockUserId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getStats', () => {
    it('should return kitchen statistics', async () => {
      const mockTickets = [
        {
          status: 'queue',
          createdAt: new Date('2025-01-01T10:00:00'),
          updatedAt: new Date('2025-01-01T10:00:00'),
        },
        {
          status: 'preparing',
          createdAt: new Date('2025-01-01T10:00:00'),
          updatedAt: new Date('2025-01-01T10:05:00'),
        },
        {
          status: 'ready',
          createdAt: new Date('2025-01-01T10:00:00'),
          updatedAt: new Date('2025-01-01T10:10:00'),
        },
        {
          status: 'delivered',
          createdAt: new Date('2025-01-01T10:00:00'),
          updatedAt: new Date('2025-01-01T10:15:00'),
        },
      ];

      vi.mocked(prisma.kitchenTicket.findMany).mockResolvedValue(
        mockTickets as any
      );

      const result = await kitchenService.getStats(mockEstablishmentId);

      expect(result.queue).toBe(1);
      expect(result.preparing).toBe(1);
      expect(result.ready).toBe(1);
      expect(result.delivered).toBe(1);
      expect(result.averageTimeMinutes).toBeGreaterThan(0);
    });

    it('should return zero average when no delivered tickets', async () => {
      const mockTickets = [
        {
          status: 'queue',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.kitchenTicket.findMany).mockResolvedValue(
        mockTickets as any
      );

      const result = await kitchenService.getStats(mockEstablishmentId);

      expect(result.averageTimeMinutes).toBe(0);
    });

    it('should count tickets by status correctly', async () => {
      const mockTickets = [
        { status: 'queue' },
        { status: 'queue' },
        { status: 'preparing' },
        { status: 'ready' },
        { status: 'ready' },
        { status: 'ready' },
      ];

      vi.mocked(prisma.kitchenTicket.findMany).mockResolvedValue(
        mockTickets as any
      );

      const result = await kitchenService.getStats(mockEstablishmentId);

      expect(result.queue).toBe(2);
      expect(result.preparing).toBe(1);
      expect(result.ready).toBe(3);
    });
  });
});
