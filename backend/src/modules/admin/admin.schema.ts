import { z } from 'zod';

/**
 * Schema para criar estabelecimento
 */
export const createEstablishmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  hasKitchen: z.boolean().default(true),
  hasOrders: z.boolean().default(true),
  hasReports: z.boolean().default(true),
  active: z.boolean().default(true),
});

export type CreateEstablishmentBody = z.infer<typeof createEstablishmentSchema>;

/**
 * Schema para atualizar estabelecimento
 */
export const updateEstablishmentSchema = z.object({
  name: z.string().min(3).optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  hasKitchen: z.boolean().optional(),
  hasOrders: z.boolean().optional(),
  hasReports: z.boolean().optional(),
  active: z.boolean().optional(),
});

export type UpdateEstablishmentBody = z.infer<typeof updateEstablishmentSchema>;

/**
 * Schema para criar usuário
 */
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  active: z.boolean().default(true),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;

/**
 * Schema para atualizar usuário
 */
export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  active: z.boolean().optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>;

/**
 * Schema para criar role de usuário
 */
export const createUserRoleSchema = z.object({
  userId: z.string().uuid('User ID inválido'),
  establishmentId: z.string().uuid('Establishment ID inválido').nullable(),
  role: z.enum(['admin_global', 'owner', 'user']),
});

export type CreateUserRoleBody = z.infer<typeof createUserRoleSchema>;

/**
 * Schema para atualizar role de usuário
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(['admin_global', 'owner', 'user']),
});

export type UpdateUserRoleBody = z.infer<typeof updateUserRoleSchema>;

/**
 * Schema para query de listagem
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
