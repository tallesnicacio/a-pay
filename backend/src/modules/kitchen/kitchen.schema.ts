import { z } from 'zod';

export const GetKitchenTicketsQuerySchema = z.object({
  status: z
    .enum(['queue', 'preparing', 'ready', 'delivered'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50)),
});

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(['queue', 'preparing', 'ready', 'delivered']),
});

export type GetKitchenTicketsQuery = z.infer<
  typeof GetKitchenTicketsQuerySchema
>;
export type UpdateTicketStatusBody = z.infer<typeof UpdateTicketStatusSchema>;
