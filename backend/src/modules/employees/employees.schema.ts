import { z } from 'zod';

/**
 * Schema para criar funcionário
 */
export const createEmployeeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['owner', 'user']),
  permissions: z
    .object({
      modules: z.object({
        orders: z.boolean(),
        kitchen: z.boolean(),
        reports: z.boolean(),
      }),
    })
    .optional(),
});

export type CreateEmployeeBody = z.infer<typeof createEmployeeSchema>;

/**
 * Schema para atualizar funcionário
 */
export const updateEmployeeSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  active: z.boolean().optional(),
  permissions: z
    .object({
      modules: z.object({
        orders: z.boolean(),
        kitchen: z.boolean(),
        reports: z.boolean(),
      }),
    })
    .optional(),
});

export type UpdateEmployeeBody = z.infer<typeof updateEmployeeSchema>;
