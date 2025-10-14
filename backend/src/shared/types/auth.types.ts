import type { AuthUser, AuthUserRole } from './auth';

// Re-exportar tipos de auth.ts
export type { AuthUser, AuthUserRole } from './auth';

/**
 * Extensão dos tipos do Fastify para incluir propriedades de autenticação
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    establishmentId?: string;
    currentRole?: AuthUserRole | null;
  }
}
