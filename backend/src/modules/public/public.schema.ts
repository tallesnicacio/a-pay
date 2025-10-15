import { z } from 'zod';

export const CreatePublicOrderSchema = z.object({
  establishmentSlug: z.string().min(1),
  code: z.string().min(1, 'Mesa/Comanda é obrigatória'),
  customerName: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive(),
      note: z.string().optional(),
    })
  ).min(1, 'Adicione pelo menos um produto'),
});

export type CreatePublicOrderBody = z.infer<typeof CreatePublicOrderSchema>;
