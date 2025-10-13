import { z } from 'zod';

/**
 * Schema de validação para parâmetros de paginação
 */
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calcula skip e take para o Prisma
 */
export function getPaginationArgs(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const take = limit;

  return { skip, take };
}

/**
 * Cria resposta paginada padronizada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Schema para cursor pagination (para uso futuro)
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
});

export type CursorPaginationParams = z.infer<typeof cursorPaginationSchema>;
