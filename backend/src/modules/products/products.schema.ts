import { z } from 'zod';

export const GetProductsQuerySchema = z.object({
  active: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  search: z.string().optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  imageUrl: z
    .string()
    .url('URL inválida')
    .max(500, 'URL muito longa')
    .optional()
    .refine(
      (url) => {
        if (!url) return true; // Opcional
        // Validar extensões de imagem comuns
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      },
      { message: 'URL deve apontar para uma imagem válida (jpg, png, gif, webp, svg)' }
    ),
  price: z.number().positive('Preço deve ser positivo'),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  description: z.string().max(1000, 'Descrição muito longa').optional().nullable(),
  imageUrl: z
    .string()
    .url('URL inválida')
    .max(500, 'URL muito longa')
    .optional()
    .nullable()
    .refine(
      (url) => {
        if (!url) return true; // Opcional
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      },
      { message: 'URL deve apontar para uma imagem válida (jpg, png, gif, webp, svg)' }
    ),
  price: z.number().positive('Preço deve ser positivo').optional(),
  active: z.boolean().optional(),
});

export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type CreateProductBody = z.infer<typeof CreateProductSchema>;
export type UpdateProductBody = z.infer<typeof UpdateProductSchema>;
