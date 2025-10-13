import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  establishmentId?: string;
  roles: Role[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  establishmentId?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    establishmentId?: string;
  }
}
