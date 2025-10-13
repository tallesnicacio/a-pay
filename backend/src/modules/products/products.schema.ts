import { z } from 'zod';

export const GetProductsQuerySchema = z.object({
  active: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  search: z.string().optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  active: z.boolean().optional(),
});

export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type CreateProductBody = z.infer<typeof CreateProductSchema>;
export type UpdateProductBody = z.infer<typeof UpdateProductSchema>;
