import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
  note: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  items: z.array(CreateOrderItemSchema).min(1),
  payNow: z.boolean().default(false),
  paymentMethod: z.enum(['cash', 'card', 'pix']).optional(),
});

export const GetOrdersQuerySchema = z.object({
  status: z.enum(['open', 'closed', 'canceled']).optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  // Paginação
  ...paginationSchema.shape,
});

export const MarkPaidSchema = z.object({
  method: z.enum(['cash', 'card', 'pix']),
  amount: z.number().positive().optional(), // Se não fornecido, assume totalAmount
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['open', 'closed', 'canceled']),
});

export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderBody = z.infer<typeof CreateOrderSchema>;
export type GetOrdersQuery = z.infer<typeof GetOrdersQuerySchema>;
export type MarkPaidBody = z.infer<typeof MarkPaidSchema>;
export type UpdateOrderStatusBody = z.infer<typeof UpdateOrderStatusSchema>;
